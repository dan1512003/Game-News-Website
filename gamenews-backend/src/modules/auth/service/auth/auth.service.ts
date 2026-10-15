import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
 
  MoreThan,
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

import { compareOtp, generateOtp, hashOtp } from '../../../../common/untils/otp.util.js';
import { PasswordResetTokenEntity } from '../../entities/password-reset-token.entity/password-reset-token.entity.js';
import { EmailResetTokenEntity } from '../../entities/email-reset-token.entity/email-reset-token.entity.js';
import { RequestPasswordResetDto } from '../../dto/password-reset.dto/request-password-reset.dto.js';
import { VerifyPasswordResetOtpDto } from '../../dto/password-reset.dto/verify-password-reset-otp.dto.js';
import { ResetPasswordDto } from '../../dto/password-reset.dto/reset-password.dto.js';
import { AccessTokenBlacklistEntity } from '../../entities/access-token-blacklist.entity/access-token-blacklist.entity.js';
import { SendEmailResetOtpDto } from '../../dto/email-reset.dto/send-email-reset-otp.dto.js';
import { ResetEmailDto } from '../../dto/email-reset.dto/reset-email.dto.js';
import { UpdateUsernameDto } from '../../../users/dto/update-username.dto/update-username.dto.js';
import { ChangePasswordDto } from '../../../users/dto/change-password.dto/change-password.dto.js';


@Injectable()
export class AuthService {
  

  private readonly otpExpiresInMs = 5 * 60 * 1000;
  private readonly resetTokenExpiresInMs = 15 * 60 * 1000;
  private readonly maxAttempts = 5;
  constructor(
   private readonly configService:
      ConfigService,


    @InjectRepository(UserEntity)
    private readonly userRepository:
      Repository<UserEntity>,

    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository:
      Repository<RefreshTokenEntity>,
  @InjectRepository(EmailResetTokenEntity)
    private readonly emailResetTokenRepository:
      Repository<EmailResetTokenEntity>,
@InjectRepository(PasswordResetTokenEntity)
private readonly passwordResetTokenRepository:
  Repository<PasswordResetTokenEntity>,
    
  @InjectRepository(AccessTokenBlacklistEntity)
  private readonly blacklistRepository: Repository<AccessTokenBlacklistEntity>,
    private readonly mailService:
      MailService,

    private readonly jwtService:
      JwtService,

 
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
async blacklistAccessToken(
  jti: string,
  expiresInSeconds: number,
): Promise<void> {
  // Token đã hết hạn thì không cần lưu vào blacklist.
  if (expiresInSeconds <= 0) {
    return;
  }

  const expiresAt = new Date(
    Date.now() + expiresInSeconds * 1000,
  );

  await this.blacklistRepository.upsert(
    {
      jti,
      expiresAt,
    },
    ['jti'],
  );
}

// Kiểm tra access token đã bị thu hồi hay chưa.
async isBlacklisted(jti: string): Promise<boolean> {
  const token = await this.blacklistRepository.findOne({
    where: {
      jti,
      expiresAt: MoreThan(new Date()),
    },
    select: {
      jti: true,
    },
  });

  return token !== null;
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




  async issueTokens(user: UserEntity,remember:boolean, deviceName: string | null,
  deviceIp: string |null,) {



  const refreshExpiresInSeconds = remember
    ? 24 * 60 * 60
    : 7 * 24 * 60 * 60;

  const refreshExpiresAt = new Date(
    Date.now() + refreshExpiresInSeconds * 1000,
  );

  // =====================================================
  // 1. CREATE ACCESS TOKEN (15 MINUTES)
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
  // 2. CREATE REFRESH TOKEN
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
  // 3. HASH REFRESH TOKEN
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
     deviceName,
    deviceIp,
    expiresAt: refreshExpiresAt,
    rememberMe:remember,
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

  // =====================================================
  // LOGIN
  // =====================================================
async login(dto: LoginDto,  deviceName: string|null,  ip: string | null,) {
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

 return this.issueTokens(
  user,
  remember,
  deviceName,
  ip,
);
}


// =====================================================
// 1. GỬI OTP ĐẾN EMAIL MỚI
// =====================================================


async sendEmailResetOtp(
  dto: SendEmailResetOtpDto,
) {
  // =====================================================
  // 1. CHUẨN HÓA EMAIL
  // =====================================================

  const normalizedEmail =
    dto.email.trim().toLowerCase();

  const normalizedEmailNew =
    dto.emailNew.trim().toLowerCase();

  // =====================================================
  // 2. EMAIL MỚI KHÔNG ĐƯỢC GIỐNG EMAIL CŨ
  // =====================================================

  if (normalizedEmail === normalizedEmailNew) {
    throw new BadRequestException(
      'Email mới phải khác email hiện tại',
    );
  }

  // =====================================================
  // 3. TÌM USER
  // =====================================================

  const user =
    await this.userRepository.findOne({
      where: {
        email: normalizedEmail,
        status: 'active',
      },
    });

  if (!user) {
    throw new NotFoundException(
      'Email cũ không tồn tại hoặc tài khoản không hoạt động',
    );
  }

  // =====================================================
  // 4. EMAIL MỚI ĐÃ ĐƯỢC USER KHÁC SỬ DỤNG?
  // =====================================================

  const existingUser =
    await this.userRepository
      .createQueryBuilder('user')
      .where(
        'LOWER(user.email) = :emailNew',
        {
          emailNew: normalizedEmailNew,
        },
      )
      .andWhere(
        'user.status = :status',
        {
          status: 'active',
        },
      )
      .andWhere(
        'user.userId <> :userId',
        {
          userId: user.userId,
        },
      )
      .getOne();

  if (existingUser) {
    throw new ConflictException(
      'Email mới đã được sử dụng. Vui lòng chọn email khác',
    );
  }

  // =====================================================
  // 5. EMAIL MỚI ĐANG ĐƯỢC USER KHÁC ĐỔI?
  // =====================================================

  const existingEmailReset =
    await this.emailResetTokenRepository
      .createQueryBuilder('token')
      .where(
        'LOWER(token.email) = :emailNew',
        {
          emailNew: normalizedEmailNew,
        },
      )
      .andWhere(
        'token.userId <> :userId',
        {
          userId: user.userId,
        },
      )
      .getOne();

  if (existingEmailReset) {
    throw new ConflictException(
      'Email mới đang được sử dụng trong một yêu cầu đổi email khác',
    );
  }

  // =====================================================
  // 6. TẠO SESSION ID
  // =====================================================

  const sessionId = randomUUID();

  // =====================================================
  // 7. TẠO OTP
  // =====================================================

  const secret =
    this.configService.getOrThrow<string>(
      'OTP_SECRET',
    );

  const otp = generateOtp();

  const otpHash =
    await hashOtp(
      otp,
      secret,
    );

  const expiresAt =
    new Date(
      Date.now() +
        this.otpExpiresInMs,
    );

  // =====================================================
  // 8. TẠO EMAIL RESET SESSION
  // =====================================================

  const token =
    this.emailResetTokenRepository.create({
      userId: user.userId,

      sessionId,

      email: normalizedEmailNew,

      otpHash,

      expiresAt,

      attempts: 0,
    });

  await this.emailResetTokenRepository.save(
    token,
  );

  // =====================================================
  // 9. GỬI OTP
  // =====================================================

  try {
    await this.mailService.sendEmailResetOtp({
      email: normalizedEmail,
      username: user.username,
      otp,
    });
  } catch (error) {
    await this.emailResetTokenRepository.delete({
      id: token.id,
    });

    throw error;
  }

  // =====================================================
  // 10. TRẢ SESSION ID CHO ANGULAR
  // =====================================================

  return {
    sessionId,

    message:
      'OTP đã được gửi đến email mới',

    expiresIn:
      this.otpExpiresInMs / 1000,
  };
}

// =====================================================
// 2. XÁC MINH OTP VÀ CẬP NHẬT EMAIL
// =====================================================
 
async resetEmail(
  userId: string,
  dto: ResetEmailDto,
) {
  const normalizedUserId =
    userId.trim();

  // =====================================================
  // 1. TÌM USER TỪ ACCESS TOKEN
  // =====================================================

  const user =
    await this.userRepository.findOne({
      where: {
        userId: normalizedUserId,
        status: 'active',
      },
    });

  if (!user) {
    throw new NotFoundException(
      'Bạn không có quyền đổi email',
    );
  }

  // =====================================================
  // 2. CHUẨN HÓA EMAIL
  // =====================================================

  const normalizedEmail =
    dto.email.trim().toLowerCase();

  const normalizedNewEmail =
    dto.newEmail.trim().toLowerCase();

  // =====================================================
  // 3. KIỂM TRA EMAIL HIỆN TẠI
  // =====================================================

  if (
    user.email.trim().toLowerCase() !==
    normalizedEmail
  ) {
    throw new UnauthorizedException(
      'Email hiện tại không hợp lệ',
    );
  }

  // =====================================================
  // 4. TÌM ĐÚNG SESSION
  //
  // Không tìm chỉ bằng userId
  // =====================================================

  const token =
    await this.emailResetTokenRepository.findOne({
      where: {
        userId: user.userId,
        sessionId: dto.sessionId,
      },
    });

  if (!token) {
    throw new UnauthorizedException(
      'Session đổi email không hợp lệ hoặc đã hết hạn',
    );
  }

  // =====================================================
  // 5. KIỂM TRA EMAIL MỚI TRONG SESSION
  // =====================================================

  if (
    token.email.trim().toLowerCase() !==
    normalizedNewEmail
  ) {
    throw new BadRequestException(
      'Email mới không khớp với yêu cầu đổi email',
    );
  }

  // =====================================================
  // 6. KIỂM TRA SESSION HẾT HẠN
  // =====================================================

  if (
    token.expiresAt.getTime() <=
    Date.now()
  ) {
    await this.emailResetTokenRepository.delete({
      id: token.id,
    });

    throw new BadRequestException(
      'OTP đã hết hạn',
    );
  }

  // =====================================================
  // 7. KIỂM TRA ATTEMPTS
  // =====================================================

  if (
    token.attempts >=
    this.maxAttempts
  ) {
    await this.emailResetTokenRepository.delete({
      id: token.id,
    });

    throw new BadRequestException({
      message:
        'Bạn đã nhập sai OTP quá số lần cho phép',

      remainingAttempts: 0,
    });
  }

  // =====================================================
  // 8. VERIFY OTP
  // =====================================================

  const secret =
    this.configService.getOrThrow<string>(
      'OTP_SECRET',
    );

  const isOtpValid =
    await compareOtp(
      dto.otp,
      token.otpHash,
      secret,
    );

  // =====================================================
  // 9. OTP SAI
  // =====================================================

  if (!isOtpValid) {
    token.attempts += 1;

    const remainingAttempts =
      this.maxAttempts -
      token.attempts;

    if (
      remainingAttempts <= 0
    ) {
      await this.emailResetTokenRepository.delete({
        id: token.id,
      });

      throw new BadRequestException({
        message:
          'Bạn đã nhập sai OTP quá số lần cho phép',

        remainingAttempts: 0,
      });
    }

    await this.emailResetTokenRepository.save(
      token,
    );

    throw new BadRequestException({
      message:
        'OTP không chính xác',

      remainingAttempts,
    });
  }

  // =====================================================
  // 10. KIỂM TRA LẠI EMAIL MỚI
  // =====================================================

  const existingUser =
    await this.userRepository
      .createQueryBuilder('user')
      .where(
        'LOWER(user.email) = :email',
        {
          email: normalizedNewEmail,
        },
      )
      .andWhere(
        'user.status = :status',
        {
          status: 'active',
        },
      )
      .andWhere(
        'user.userId <> :userId',
        {
          userId: user.userId,
        },
      )
      .getOne();

  if (existingUser) {
    throw new ConflictException(
      'Email mới đã được sử dụng',
    );
  }

  // =====================================================
  // 11. ĐỔI EMAIL
  // =====================================================

  user.email =
    normalizedNewEmail;

  const updatedUser =
    await this.userRepository.save(
      user,
    );

  // =====================================================
  // 12. SESSION CHỈ ĐƯỢC DÙNG 1 LẦN
  // =====================================================

  await this.emailResetTokenRepository.delete({
    id: token.id,
  });

  // =====================================================
  // 13. RESPONSE
  // =====================================================

  return {
    user: updatedUser,

    message:
      'Đổi email thành công',
  };
}





// =====================================================
// 1. YÊU CẦU ĐẶT LẠI MẬT KHẨU
// =====================================================

async requestPasswordReset(
  dto: RequestPasswordResetDto,
) {
  const normalizedEmail =
    dto.email.trim().toLowerCase();

  const user =
    await this.userRepository.findOne({
      where: {
        email: normalizedEmail,
        status: 'active',
      },
    });

  // Không tiết lộ email có tồn tại hay không
  if (!user) {
    return {
      message:
        'Nếu email hợp lệ, mã OTP sẽ được gửi đến email của bạn.',
    };
  }

  const secret =
    this.configService.getOrThrow<string>(
      'OTP_SECRET',
    );

  // ==========================================
  // Tạo session cho lần reset này
  // ==========================================

  const sessionId = randomUUID();

  // ==========================================
  // Tạo OTP
  // ==========================================

  const otp = generateOtp();

  const otpHash =
    await hashOtp(
      otp,
      secret,
    );

  const expiresAt =
    new Date(
      Date.now() +
        this.otpExpiresInMs,
    );

  // ==========================================
  // Lưu session
  // ==========================================

  const resetSession =
    this.passwordResetTokenRepository.create({
      userId: user.userId,

      sessionId,

      otpHash,

      expiresAt,

      attempts: 0,

      resetTokenHash: null,


    expireResetTokenAt:null
    });

  await this.passwordResetTokenRepository.save(
    resetSession,
  );

  // ==========================================
  // Gửi OTP
  // ==========================================

  try {
    await this.mailService.sendPasswordResetOtp({
      email: user.email,
      username: user.username,
      otp,
    });
  } catch (error) {
    await this.passwordResetTokenRepository.delete({
      id: resetSession.id,
    });

    throw error;
  }

  // Chỉ trả sessionId
  return {
    sessionId,

    message:
      'Nếu email hợp lệ, mã OTP sẽ được gửi đến email của bạn.',

    expiresIn:
      this.otpExpiresInMs / 1000,
  };
}
// =====================================================
// 2. XÁC NHẬN OTP ĐẶT LẠI MẬT KHẨU
// =====================================================

// =====================================================
// 2. XÁC NHẬN OTP ĐẶT LẠI MẬT KHẨU
// =====================================================

async verifyPasswordResetOtp(
  dto: VerifyPasswordResetOtpDto,
  currentResetToken?: string,
) {
  console.log('\n');
  console.log('====================================================');
  console.log('VERIFY PASSWORD RESET OTP - START');
  console.log('====================================================');

  console.log('[1] DTO RECEIVED:', {
    email: dto.email,
    sessionId: dto.sessionId,
    otpLength: dto.otp?.length ?? 0,
  });

  console.log('[1.1] Current reset cookie:', {
    exists: !!currentResetToken,
    length: currentResetToken?.length ?? 0,
  });

  // =====================================================
  // 1. NORMALIZE EMAIL
  // =====================================================

  const normalizedEmail =
    dto.email.trim().toLowerCase();

  console.log('[2] Normalized email:', normalizedEmail);

  // =====================================================
  // 2. FIND USER
  // =====================================================

  console.log('[3] Searching user...');

  const user =
    await this.userRepository.findOne({
      where: {
        email: normalizedEmail,
        status: 'active',
      },
    });

  console.log('[3.1] User search result:', {
    found: !!user,
    userId: user?.userId,
    email: user?.email,
    status: user?.status,
  });

  if (!user) {
    console.error('[3.2] USER NOT FOUND');

    throw new UnauthorizedException(
      'OTP không hợp lệ hoặc đã hết hạn',
    );
  }

  // =====================================================
  // 3. FIND SESSION
  // =====================================================

  console.log('[4] Searching password reset session...');

  console.log('[4.1] Search condition:', {
    userId: user.userId,
    sessionId: dto.sessionId,
  });

  const token =
    await this.passwordResetTokenRepository.findOne({
      where: {
        userId: user.userId,
        sessionId: dto.sessionId,
      },
    });

  console.log('[4.2] Session result:', {
    found: !!token,
    id: token?.id,
    userId: token?.userId,
    sessionId: token?.sessionId,
    attempts: token?.attempts,
    expiresAt: token?.expiresAt,
    hasOtpHash: !!token?.otpHash,
    hasResetTokenHash: !!token?.resetTokenHash,
    expireResetTokenAt:
      token?.expireResetTokenAt,
  });

  if (!token) {
    console.error('[4.3] SESSION NOT FOUND');

    throw new UnauthorizedException(
      'OTP không hợp lệ hoặc đã hết hạn',
    );
  }

  // =====================================================
  // 4. CHECK OTP EXPIRATION
  // =====================================================

  const now = Date.now();

  const otpExpired =
    token.expiresAt.getTime() <= now;

  console.log('[5] OTP expiration check:', {
    now: new Date(now),
    expiresAt: token.expiresAt,
    expiresAtMs:
      token.expiresAt.getTime(),
    expired: otpExpired,
  });

  if (otpExpired) {
    console.warn('[5.1] OTP EXPIRED');

    await this.passwordResetTokenRepository.delete({
      id: token.id,
    });

    console.log(
      '[5.2] Expired password reset session deleted:',
      token.id,
    );

    throw new UnauthorizedException(
      'OTP đã hết hạn',
    );
  }

  // =====================================================
  // 5. CHECK ATTEMPTS
  // =====================================================

  console.log('[6] Attempts check:', {
    attempts: token.attempts,
    maxAttempts: this.maxAttempts,
    remaining:
      this.maxAttempts -
      token.attempts,
  });

  if (
    token.attempts >=
    this.maxAttempts
  ) {
    console.warn(
      '[6.1] MAX ATTEMPTS REACHED',
    );

    await this.passwordResetTokenRepository.delete({
      id: token.id,
    });

    console.log(
      '[6.2] Locked session deleted:',
      token.id,
    );

    throw new UnauthorizedException(
      'Bạn đã nhập sai OTP quá số lần cho phép',
    );
  }

  // =====================================================
  // 6. VERIFY OTP
  // =====================================================

  console.log('[7] Verifying OTP...');

  const secret =
    this.configService.getOrThrow<string>(
      'OTP_SECRET',
    );

  console.log('[7.1] OTP_SECRET exists:', !!secret);

  const isOtpValid =
    await compareOtp(
      dto.otp,
      token.otpHash,
      secret,
    );

  console.log('[7.2] OTP validation result:', {
    valid: isOtpValid,
  });

  // =====================================================
  // 7. OTP INVALID
  // =====================================================

  if (!isOtpValid) {
    console.warn('[8] OTP INVALID');

    token.attempts += 1;

    const remainingAttempts =
      this.maxAttempts -
      token.attempts;

    console.log('[8.1] Attempt updated:', {
      attempts: token.attempts,
      maxAttempts: this.maxAttempts,
      remainingAttempts,
    });

    if (
      remainingAttempts <= 0
    ) {
      console.error(
        '[8.2] ATTEMPTS EXCEEDED - DELETING SESSION',
      );

      await this.passwordResetTokenRepository.delete({
        id: token.id,
      });

      throw new UnauthorizedException({
        message:
          'Bạn đã nhập sai OTP quá số lần cho phép',

        remainingAttempts: 0,
      });
    }

    await this.passwordResetTokenRepository.save(
      token,
    );

    console.log(
      '[8.3] Failed attempt saved to DB',
    );

    throw new UnauthorizedException({
      message:
        'OTP không chính xác',

      remainingAttempts,
    });
  }

  // =====================================================
  // 8. OTP VALID
  // =====================================================

  console.log(
    '[9] OTP VERIFIED SUCCESSFULLY',
  );

  // =====================================================
  // 9. CHECK EXISTING RESET COOKIE
  // =====================================================

  if (currentResetToken) {
    console.log(
      '[10] Existing reset cookie FOUND',
    );

    const currentResetTokenHash =
      createHash('sha256')
        .update(currentResetToken)
        .digest('hex');

    console.log(
      '[10.1] Current cookie hash:',
      currentResetTokenHash,
    );

    console.log(
      '[10.2] DB reset token hash:',
      token.resetTokenHash,
    );

    const sameToken =
      token.resetTokenHash ===
      currentResetTokenHash;

    console.log(
      '[10.3] Cookie hash === DB hash:',
      sameToken,
    );

    const resetTokenStillValid =
      token.expireResetTokenAt !== null &&
      token.expireResetTokenAt.getTime() >
        Date.now();

    console.log(
      '[10.4] Reset token expiration:',
      {
        expireResetTokenAt:
          token.expireResetTokenAt,

        now: new Date(),

        valid:
          resetTokenStillValid,
      },
    );

    // ===================================================
    // EXISTING TOKEN VALID
    // ===================================================

    if (
      sameToken &&
      resetTokenStillValid
    ) {
      console.log(
        '[11] EXISTING RESET TOKEN IS VALID',
      );

      console.log(
        '[11.1] No new reset token will be generated',
      );

      console.log(
        '[11.2] Returning success',
      );

      console.log(
        '====================================================',
      );
      console.log(
        'VERIFY PASSWORD RESET OTP - END',
      );
      console.log(
        '====================================================',
      );

      return {
        resetToken: null,

        expireResetTokenAt:
          token.expireResetTokenAt,

        message:
          'OTP xác nhận thành công',
      };
    }

    console.warn(
      '[11.3] Existing reset cookie is INVALID or EXPIRED',
    );
  } else {
    console.log(
      '[10] No existing reset cookie',
    );
  }

  // =====================================================
  // 10. GENERATE NEW RESET TOKEN
  // =====================================================

  console.log(
    '[12] Generating NEW reset token...',
  );

  const resetToken =
    randomBytes(32).toString('hex');

  const resetTokenHash =
    createHash('sha256')
      .update(resetToken)
      .digest('hex');

  const expireResetTokenAt =
    new Date(
      Date.now() +
        this.resetTokenExpiresInMs,
    );

  console.log(
    '[12.1] New reset token generated:',
    {
      tokenLength:
        resetToken.length,

      hash:
        resetTokenHash,

      expireResetTokenAt,

      expiresInMs:
        this.resetTokenExpiresInMs,
    },
  );

  // =====================================================
  // 11. SAVE TOKEN
  // =====================================================

  token.resetTokenHash =
    resetTokenHash;

  token.expireResetTokenAt =
    expireResetTokenAt;

  console.log(
    '[13] Saving reset token to DB:',
    {
      id: token.id,
      userId: token.userId,
      sessionId: token.sessionId,
      expireResetTokenAt:
        token.expireResetTokenAt,
    },
  );

  await this.passwordResetTokenRepository.save(
    token,
  );

  console.log(
    '[13.1] Reset token saved successfully',
  );

  // =====================================================
  // 12. RETURN TOKEN TO CONTROLLER
  // =====================================================

  console.log(
    '[14] Returning reset token to controller',
  );

  console.log(
    '[14.1] Return data:',
    {
      hasResetToken: !!resetToken,
      resetTokenLength:
        resetToken.length,
      expireResetTokenAt,
      message:
        'OTP xác nhận thành công',
    },
  );

  console.log(
    '====================================================',
  );
  console.log(
    'VERIFY PASSWORD RESET OTP - END',
  );
  console.log(
    '====================================================\n',
  );

  return {
    resetToken,

    expireResetTokenAt,

    message:
      'OTP xác nhận thành công',
  };
}

// =====================================================
// 3. ĐẶT LẠI MẬT KHẨU
// =====================================================

// =====================================================
// 3. ĐẶT LẠI MẬT KHẨU
// =====================================================


async resetPassword(
  dto: ResetPasswordDto,
  resetToken: string,
) {
  console.log(
    '\n========== RESET PASSWORD START =========='
  );

  console.log('[ResetPassword] DTO:', {
    email: dto.email,
    sessionId: dto.sessionId,
    hasNewPassword: !!dto.newPassword,
    hasConfirmPassword: !!dto.confirmPassword,
  });

  // =====================================================
  // 1. NORMALIZE EMAIL
  // =====================================================

  const normalizedEmail =
    dto.email.trim().toLowerCase();

  console.log(
    '[ResetPassword] normalizedEmail:',
    normalizedEmail,
  );


  // =====================================================
  // 2. TÌM USER
  // =====================================================

  const user =
    await this.userRepository.findOne({
      where: {
        email: normalizedEmail,
        status: 'active',
      },
    });

  console.log(
    '[ResetPassword] User found:',
    !!user,
  );

  if (user) {
    console.log('[ResetPassword] User:', {
      userId: user.userId,
      username: user.username,
      email: user.email,
      status: user.status,
    });
  }

  if (!user) {
    console.error(
      '[ResetPassword] USER NOT FOUND',
    );

    throw new UnauthorizedException(
      'Reset token không hợp lệ',
    );
  }


  // =====================================================
  // 3. KIỂM TRA RESET TOKEN COOKIE
  // =====================================================

  console.log(
    '[ResetPassword] Has resetToken:',
    !!resetToken,
  );

  console.log(
    '[ResetPassword] resetToken length:',
    resetToken?.length ?? 0,
  );

  if (!resetToken) {
    console.error(
      '[ResetPassword] RESET TOKEN COOKIE NOT FOUND',
    );

    throw new UnauthorizedException(
      'Reset token không tồn tại',
    );
  }


  // =====================================================
  // 4. HASH RESET TOKEN
  // =====================================================

  const resetTokenHash =
    createHash('sha256')
      .update(resetToken)
      .digest('hex');

  console.log(
    '[ResetPassword] resetTokenHash:',
    resetTokenHash,
  );


  // =====================================================
  // 5. TÌM ĐÚNG SESSION + USER + RESET TOKEN
  // =====================================================

  console.log(
    '[ResetPassword] Searching token with:',
    {
      userId: user.userId,
      sessionId: dto.sessionId,
      resetTokenHash,
    },
  );

  const token =
    await this.passwordResetTokenRepository.findOne({
      where: {
        userId: user.userId,

        sessionId: dto.sessionId,

        resetTokenHash,
      },
    });


  console.log(
    '[ResetPassword] Reset token record found:',
    !!token,
  );

  if (token) {
    console.log(
      '[ResetPassword] DB token:',
      {
        id: token.id,
        userId: token.userId,
        sessionId: token.sessionId,
        resetTokenHash: token.resetTokenHash,
        expiresAt: token.expiresAt,
        expireResetTokenAt:
          token.expireResetTokenAt,
        attempts: token.attempts,
      },
    );
  }


  if (!token) {
    console.error(
      '[ResetPassword] TOKEN NOT FOUND',
    );

    throw new UnauthorizedException(
      'Reset token không hợp lệ hoặc đã hết hạn',
    );
  }


  // =====================================================
  // 6. KIỂM TRA RESET TOKEN HẾT HẠN
  // =====================================================

  const expireTime =
    token.expireResetTokenAt?.getTime();

  const now =
    Date.now();

  console.log(
    '[ResetPassword] Expiration check:',
    {
      now: new Date(now),
      expireResetTokenAt:
        token.expireResetTokenAt,
      isExpired:
        !expireTime ||
        expireTime <= now,
    },
  );


  if (
    !token.expireResetTokenAt ||
    token.expireResetTokenAt.getTime() <=
      Date.now()
  ) {

    console.error(
      '[ResetPassword] RESET TOKEN EXPIRED',
    );

    await this.passwordResetTokenRepository.delete({
      id: token.id,
    });

    console.log(
      '[ResetPassword] Expired token deleted:',
      token.id,
    );

    throw new UnauthorizedException(
      'Reset token đã hết hạn hoặc không hợp lệ',
    );
  }


  // =====================================================
  // 7. HASH PASSWORD MỚI
  // =====================================================

  console.log(
    '[ResetPassword] Hashing new password...',
  );

  const passwordHash =
    await bcrypt.hash(
      dto.newPassword,
      12,
    );

  console.log(
    '[ResetPassword] Password hash created:',
    !!passwordHash,
  );


  // =====================================================
  // 8. CẬP NHẬT PASSWORD
  // =====================================================

  user.passwordHash =
    passwordHash;

  console.log(
    '[ResetPassword] Saving new password for user:',
    user.userId,
  );

  const updatedUser =
    await this.userRepository.save(
      user,
    );

  console.log(
    '[ResetPassword] Password updated successfully:',
    {
      userId: updatedUser.userId,
      email: updatedUser.email,
    },
  );


  // =====================================================
  // 9. XÓA PASSWORD RESET SESSION
  // =====================================================

  console.log(
    '[ResetPassword] Deleting used reset session:',
    token.id,
  );

  await this.passwordResetTokenRepository.delete({
    id: token.id,
  });

  console.log(
    '[ResetPassword] Reset session deleted successfully',
  );


  // =====================================================
  // 10. RESPONSE
  // =====================================================

  console.log(
    '[ResetPassword] PASSWORD RESET SUCCESS',
  );

  console.log(
    '========== RESET PASSWORD END ==========\n',
  );

  return {
    user: {
      userId: updatedUser.userId,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
    },

    message:
      'Đặt lại mật khẩu thành công',
  };
}

async updateUsername(userId:string,dto: UpdateUsernameDto) {
   const normalizedUserId = dto.userId.trim();
    const requestedUserId = dto.userId.trim();
  const username = dto.username.trim();

  // User trong JWT phải trùng userId mà client gửi
  if (normalizedUserId !== requestedUserId) {
    throw new ForbiddenException(
      'Bạn không có quyền thay đổi người dùng này',
    );
  }

const user =await this.userRepository.findOne({
    where: {userId: normalizedUserId },
  });

  if (!user ) {
    throw new NotFoundException('Người dùng không tồn tại');
  }

  // 2. Kiểm tra username hiện tại 
  if (user.username === username) {
    throw new BadRequestException(
      'Username trùng với username hiện tại',
    );
  }

  // 3. Kiểm tra username đã được sử dụng
  const existingUser = await this.userRepository.findOne({
    where: { username },
  });

  if (existingUser) {
    throw new ConflictException({
      message: 'Validation failed',
      errors: [
        {
          field: 'username',
          messages: ['Username đã tồn tại'],
        },
      ],
    });
  }

  // 4. Cập nhật username
  user.username = username;

  const updatedUser = await this.userRepository.save(user);

  // 5. Trả về user, không trả passwordHash
  return {

    user: {
      userId: updatedUser.userId,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
    },
      message:
        'update usernam successfully',

    };

}

// =====================================================
// CHANGE PASSWORD
// =====================================================

async changePassword(userId: string,dto: ChangePasswordDto) {
 const normalizedUserId = userId.trim();
    const requestedUserId = dto.userId.trim();


  // User trong JWT phải trùng userId mà client gửi
  if (normalizedUserId !== requestedUserId) {
    throw new ForbiddenException(
      'Bạn không có quyền thay đổi người dùng này',
    );
  }

const user =await this.userRepository.findOne({
    where: {userId: normalizedUserId },
  });

  if (!user ) {
    throw new NotFoundException('Người dùng không tồn tại');
  }
  // 2. Kiểm tra mật khẩu hiện tại
  const isCurrentPasswordValid = await bcrypt.compare(
    dto.currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    throw new UnauthorizedException(
      'Mật khẩu hiện tại không chính xác',
    );
  }

  // 3. Không cho dùng lại mật khẩu hiện tại
  const isSamePassword = await bcrypt.compare(
    dto.newPassword,
    user.passwordHash,
  );

  if (isSamePassword) {
    throw new BadRequestException(
      'Mật khẩu mới phải khác mật khẩu hiện tại',
    );
  }

 

  // 5. Hash mật khẩu mới
  const passwordHash = await bcrypt.hash(
    dto.newPassword,
    12,
  );

  user.passwordHash = passwordHash;

const updatedPassword =await this.userRepository.save(user);

  // 6. Trả về thông tin an toàn
  return {
   user:updatedPassword
  };
}
}