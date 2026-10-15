import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  ConfigService,
} from '@nestjs/config';

import * as bcrypt from 'bcrypt';

import {
  createHash,
  randomBytes,
  randomUUID,
} from 'crypto';

import { UserEntity } from '../../../users/entities/user.entity/user.entity.js';

import { MailService } from '../../../mail/mail.service.js';

import { RefreshTokenEntity } from '../../entities/refresh-token.entity/refresh-token.entity.js';

import { RegisterDto } from '../../dto/register.dto/register.dto.js';

import { LoginDto } from '../../dto/login.dto/login.dto.js';


@Injectable()
export class AuthService {

  constructor(

    @InjectRepository(UserEntity)
    private readonly userRepository:
      Repository<UserEntity>,

    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository:
      Repository<RefreshTokenEntity>,

    private readonly mailService:
      MailService,

    private readonly jwtService:
      JwtService,

    private readonly configService:
      ConfigService,

  ) {}


  // =====================================================
  // REGISTER
  // =====================================================

  async register(
    dto: RegisterDto,
  ) {

    const {
      username,
      email,
      password,
    } = dto;


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const usernameExists =
      await this.userRepository.findOne({

        where: {
          username,
        },

      });


    if (usernameExists) {

      throw new ConflictException({

        message:
          'Validation failed',

        errors: [

          {

            field:
              'username',

            messages: [
              'Username đã tồn tại',
            ],

          },

        ],

      });

    }


    const verifiedUser =
      await this.userRepository.findOne({

        where: {

          email:
            normalizedEmail,

          status:
            'active',

        },

      });


    if (verifiedUser) {

      throw new ConflictException({

        message:
          'Validation failed',

        errors: [

          {

            field:
              'email',

            messages: [
              'Email đã được đăng ký',
            ],

          },

        ],

      });

    }


    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );


    const verificationToken =
      randomBytes(32)
        .toString('hex');


    const verificationTokenHash =
      await bcrypt.hash(
        verificationToken,
        12,
      );


    const verificationExpiresAt =
      new Date(
        Date.now() +
        24 *
        60 *
        60 *
        1000,
      );


    const user =
      this.userRepository.create({

        username,

        email:
          normalizedEmail,

        passwordHash,

        role:
          'user',

        status:
          'pending_verification',

        verificationTokenHash,

        verificationExpiresAt,

      });


    const savedUser =
      await this.userRepository.save(
        user,
      );


    await this.mailService
      .sendVerificationEmail({

        email:
          savedUser.email,

        username:
          savedUser.username,

        userId:
          savedUser.userId,

        token:
          verificationToken,

      });


    return {

      message:
        'Đăng ký thành công. Vui lòng kiểm tra Gmail để xác thực tài khoản.',

      user: {

        userId:
          savedUser.userId,

        username:
          savedUser.username,

        email:
          savedUser.email,

        role:
          savedUser.role,

        status:
          savedUser.status,

      },

    };

  }


  // =====================================================
  // VERIFY EMAIL
  // =====================================================

  async verifyEmail(
    userId: string,
    token: string,
  ) {

    const user =
      await this.userRepository.findOne({

        where: {

          userId,

          status:
            'pending_verification',

        },

      });


    if (!user) {

      throw new UnauthorizedException({

        message:
          'Validation failed',

        errors: [

          {

            field:
              'token',

            messages: [
              'Link xác thực không hợp lệ',
            ],

          },

        ],

      });

    }


    if (
      !user.verificationTokenHash
    ) {

      throw new UnauthorizedException({

        message:
          'Validation failed',

        errors: [

          {

            field:
              'token',

            messages: [
              'Token xác thực không hợp lệ',
            ],

          },

        ],

      });

    }


    if (
      !user.verificationExpiresAt ||
      user.verificationExpiresAt.getTime() <=
        Date.now()
    ) {

      throw new UnauthorizedException({

        message:
          'Validation failed',

        errors: [

          {

            field:
              'token',

            messages: [
              'Token xác thực đã hết hạn',
            ],

          },

        ],

      });

    }


    const tokenValid =
      await bcrypt.compare(
        token,
        user.verificationTokenHash,
      );


    if (!tokenValid) {

      throw new UnauthorizedException({

        message:
          'Validation failed',

        errors: [

          {

            field:
              'token',

            messages: [
              'Token xác thực không hợp lệ',
            ],

          },

        ],

      });

    }


    const otherPendingUsers =
      await this.userRepository.find({

        where: {

          email:
            user.email,

          status:
            'pending_verification',

        },

      });


    user.status =
      'active';

    user.verificationTokenHash =
      null;

    user.verificationExpiresAt =
      null;


    await this.userRepository.save(
      user,
    );


    const usersToDelete =
      otherPendingUsers.filter(
        otherUser =>
          otherUser.userId !==
          user.userId,
      );


    if (
      usersToDelete.length > 0
    ) {

      await this.userRepository.remove(
        usersToDelete,
      );

    }


    return {

      message:
        'Xác thực email thành công. Bạn có thể đăng nhập.',

    };

  }


  // =====================================================
  // LOGIN
  // =====================================================
async login(dto: LoginDto) {
  const {
    email,
    password,
    remember = false,
  } = dto;

  // =====================================================
  // 1. NORMALIZE EMAIL
  // =====================================================

  const normalizedEmail = email.trim().toLowerCase();

  // =====================================================
  // 2. FIND ACTIVE USER
  // =====================================================

  const user = await this.userRepository.findOne({
    where: {
      email: normalizedEmail,
      status: 'active',
    },
  });

  if (!user) {
    throw new UnauthorizedException(
      'Email hoặc mật khẩu không chính xác',
    );
  }

  // =====================================================
  // 3. CHECK PASSWORD
  // =====================================================

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new UnauthorizedException(
      'Email hoặc mật khẩu không chính xác',
    );
  }

  // =====================================================
  // 4. DETERMINE REFRESH TOKEN EXPIRATION
  // =====================================================

  // remember = true  -> 1 ngày
  // remember = false -> 7 ngày

  const refreshExpiresInSeconds = remember
    ? 24 * 60 * 60
    : 7 * 24 * 60 * 60;

  const refreshExpiresAt = new Date(
    Date.now() + refreshExpiresInSeconds * 1000,
  );

  // =====================================================
  // 5. CREATE ACCESS TOKEN (15 MINUTES)
  // =====================================================

  const accessJti = randomUUID();

  const accessToken = await this.jwtService.signAsync(
    {
      sub: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      jti: accessJti,
      type: 'access',
    },
    {
      secret: this.configService.getOrThrow<string>(
        'JWT_ACCESS_SECRET',
      ),
      expiresIn: '15m',
    },
  );

  // =====================================================
  // 6. CREATE REFRESH TOKEN
  // =====================================================

  const refreshJti = randomUUID();

  const refreshToken = await this.jwtService.signAsync(
    {
      sub: user.userId,
      email: user.email,
      jti: refreshJti,
      type: 'refresh',
    },
    {
      secret: this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      ),
      expiresIn: refreshExpiresInSeconds,
    },
  );

  // =====================================================
  // 7. HASH REFRESH TOKEN
  // =====================================================

  const tokenHash = createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // =====================================================
  // 8. CREATE TOKEN FAMILY
  // =====================================================

  const familyId = randomUUID();

  // =====================================================
  // 9. SAVE REFRESH TOKEN TO DATABASE
  // =====================================================

  await this.refreshTokenRepository.insert({
    userId: user.userId,
    jti: refreshJti,
    tokenHash,
    familyId,
    expiresAt: refreshExpiresAt,
    revokedAt: null,
  });

  // =====================================================
  // 10. RETURN RESULT
  // =====================================================

  return {
    user: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },

    accessToken,
    refreshToken,
    refreshExpiresAt,
  };
}
}