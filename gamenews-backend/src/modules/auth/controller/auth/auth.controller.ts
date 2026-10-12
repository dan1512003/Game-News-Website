import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';

import type {
  Request,
  Response,
} from 'express';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  IsNull,
  Repository,
} from 'typeorm';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  ConfigService,
} from '@nestjs/config';

import {
  AuthGuard,
} from '@nestjs/passport';

import * as crypto from 'crypto';

import { AuthService } from '../../service/auth/auth.service.js';

import { RegisterDto } from '../../dto/register.dto/register.dto.js';

import { LoginDto } from '../../dto/login.dto/login.dto.js';

import { RefreshTokenEntity } from '../../entities/refresh-token.entity/refresh-token.entity.js';

import { UserEntity } from '../../../users/entities/user.entity/user.entity.js';


@Controller('auth')
export class AuthController {

  constructor(

    private readonly authService:
      AuthService,
@InjectRepository(UserEntity)
private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo:
      Repository<RefreshTokenEntity>,

    private readonly jwtService:
      JwtService,

    private readonly configService:
      ConfigService,

  ) {}


  // =====================================================
  // REGISTER
  // =====================================================

  @Post('register')
  register(
    @Body() dto: RegisterDto,
  ) {

    return this.authService.register(
      dto,
    );

  }


  // =====================================================
  // VERIFY EMAIL
  // =====================================================

  @Get('verify-email')
  verifyEmail(

    @Query('userId')
    userId: string,

    @Query('token')
    token: string,

  ) {

    return this.authService.verifyEmail(
      userId,
      token,
    );

  }


  // =====================================================
  // LOGIN
  // =====================================================

 @Post('login')
@HttpCode(200)
async login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.authService.login(dto);

  // =====================================================
  // SET REFRESH TOKEN COOKIE
  // =====================================================

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production',

    sameSite: 'strict',

    path: '/auth/refresh',

    maxAge: Math.max(
      result.refreshExpiresAt.getTime() - Date.now(),
      0,
    ),
  });

  // =====================================================
  // RETURN RESPONSE
  // =====================================================

  return {
    user: result.user,
    accessToken: result.accessToken,
    refreshExpiresAt: result.refreshExpiresAt,
  };
}


  // =====================================================
  // REFRESH TOKEN
  // =====================================================

  @UseGuards(
    AuthGuard('jwt-refresh'),
  )
  @Post('refresh')
  @HttpCode(200)
async refresh(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  console.log('\n========== REFRESH START ==========');

  try {
    // ================================================
    // 1. GET REFRESH TOKEN FROM COOKIE
    // ================================================

    const refreshToken = req.cookies?.['refresh_token'];

    console.log('[1] Cookie exists:', !!refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token missing',
      );
    }

    // ================================================
    // 2. GET JWT PAYLOAD
    // ================================================

    const payload = req.user as {
      sub: string;
      email: string;
      jti?: string;
      type?: string;
    };

    if (
      !payload?.sub ||
      !payload?.email ||
      payload.type !== 'refresh'
    ) {
      throw new UnauthorizedException(
        'Invalid refresh token payload',
      );
    }

    const userId = payload.sub;

    console.log('[2] User ID:', userId);
    console.log('[2] Token type:', payload.type);

    // ================================================
    // 3. FIND USER
    // ================================================

    const user = await this.userRepo.findOne({
      where: {
        userId: userId,
      },
      select: {
       userId: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      console.error('[ERROR] User not found:', userId);

      throw new UnauthorizedException(
        'User not found',
      );
    }

    console.log('[3] User found:', {
      id: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    // ================================================
    // 4. HASH CURRENT REFRESH TOKEN
    // ================================================

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // ================================================
    // 5. FIND ACTIVE REFRESH TOKEN
    // ================================================

    const storedToken =
      await this.refreshTokenRepo.findOne({
        where: {
          userId,
          tokenHash,
          revokedAt: IsNull(),
        },
      });

    console.log(
      '[5] Active token found:',
      !!storedToken,
    );

    // ================================================
    // 6. CHECK TOKEN REUSE
    // ================================================

    if (!storedToken) {
      const revokedToken =
        await this.refreshTokenRepo.findOne({
          where: {
            userId,
            tokenHash,
          },
        });

      if (revokedToken?.revokedAt) {
        console.error(
          '[SECURITY] Refresh token reuse detected',
        );

        await this.refreshTokenRepo
          .createQueryBuilder()
          .update(RefreshTokenEntity)
          .set({
            revokedAt: new Date(),
          })
          .where('"family_id" = :familyId', {
            familyId: revokedToken.familyId,
          })
          .andWhere('"revoked_at" IS NULL')
          .execute();

        res.clearCookie('refresh_token', {
          path: '/auth/refresh',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        throw new UnauthorizedException(
          'Refresh token reuse detected — all sessions invalidated',
        );
      }

      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    // ================================================
    // 7. CHECK EXPIRATION
    // ================================================

    if (
      storedToken.expiresAt.getTime() <= Date.now()
    ) {
      await this.refreshTokenRepo.update(
        {
          id: storedToken.id,
        },
        {
          revokedAt: new Date(),
        },
      );

      res.clearCookie('refresh_token', {
        path: '/auth/refresh',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      throw new UnauthorizedException(
        'Refresh token expired',
      );
    }

    console.log('[7] Refresh token valid');

    // ================================================
    // 8. REVOKE OLD TOKEN
    // ================================================

    const revokeResult =
      await this.refreshTokenRepo.update(
        {
          id: storedToken.id,
          revokedAt: IsNull(),
        },
        {
          revokedAt: new Date(),
        },
      );

    if (revokeResult.affected !== 1) {
      throw new UnauthorizedException(
        'Refresh token already used',
      );
    }

    console.log('[8] Old refresh token revoked');

    // ================================================
    // 9. CREATE NEW ACCESS TOKEN
    // ================================================

    const newAccessJti = crypto.randomUUID();

    const newAccessToken =
      await this.jwtService.signAsync(
        {
          sub: String(user.userId),
          email: user.email,
          jti: newAccessJti,
          type: 'access',
        },
        {
          secret:
            this.configService.getOrThrow<string>(
              'JWT_ACCESS_SECRET',
            ),
          expiresIn: '15m',
        },
      );

    console.log('[9] New access token created');

    // ================================================
    // 10. CREATE NEW REFRESH TOKEN
    // ================================================

    const newRefreshJti = crypto.randomUUID();

    const newRefreshToken =
      await this.jwtService.signAsync(
        {
          sub: String(user.userId),
          email: user.email,
          jti: newRefreshJti,
          type: 'refresh',
        },
        {
          secret:
            this.configService.getOrThrow<string>(
              'JWT_REFRESH_SECRET',
            ),
          expiresIn: '30d',
        },
      );

    console.log('[10] New refresh token created');

    // ================================================
    // 11. HASH NEW REFRESH TOKEN
    // ================================================

    const newTokenHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    // ================================================
    // 12. SAVE NEW REFRESH TOKEN
    // ================================================

    const expiresAt = new Date(
      Date.now() +
        30 * 24 * 60 * 60 * 1000,
    );

    await this.refreshTokenRepo.insert({
      userId: String(user.userId),
      jti: newRefreshJti,
      tokenHash: newTokenHash,
      familyId: storedToken.familyId,
      expiresAt,
      revokedAt: null,
    });

    console.log('[12] New refresh token saved');

    // ================================================
    // 13. SET NEW REFRESH COOKIE
    // ================================================

    res.cookie(
      'refresh_token',
      newRefreshToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    );

    console.log('[13] Refresh cookie configured');

    // ================================================
    // 14. RETURN TOKEN + USER INFORMATION
    // ================================================

    console.log('[SUCCESS] Refresh completed');
    console.log('========== REFRESH END ==========\n');

    return {
      message: 'Refresh successful',

      accessToken: newAccessToken,

      user: {
        id: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      console.warn(
        '[REFRESH DENIED]',
        error.message,
      );
    } else {
      console.error(
        '[REFRESH INTERNAL ERROR]',
        error,
      );
    }

    console.log('========== REFRESH FAILED ==========\n');

    throw error;
  }
}

  // =====================================================
  // LOGOUT
  // =====================================================

  @Post('logout')
  @UseGuards(
    AuthGuard('jwt'),
  )
  @HttpCode(200)
  async logout(

    @Req()
    req: Request,

    @Res({
      passthrough: true,
    })
    res: Response,

  ) {

    const user =
      req.user as UserEntity;


    // =================================================
    // REVOKE CURRENT REFRESH TOKEN
    // =================================================

    const refreshToken =
      req.cookies?.[
        'refresh_token'
      ];


    if (refreshToken) {

      const tokenHash =
        crypto
          .createHash('sha256')
          .update(refreshToken)
          .digest('hex');


      await this.refreshTokenRepo.update(

        {

          userId:
            user.userId,

          tokenHash,

        },

        {

          revokedAt:
            new Date(),

        },

      );

    }


    // =================================================
    // CLEAR COOKIE
    // =================================================

    res.clearCookie(

      'refresh_token',

      {

        path:
          '/auth/refresh',

      },

    );


    return {

      message:
        'Logged out successfully',

    };

  }

@Get('me')
@UseGuards(AuthGuard('jwt'))
@HttpCode(200)
async getMe(@Req() req: Request) {
  const payload = req.user as {
    userId: string;
  };

  const user = await this.userRepo.findOne({
    where: {
      userId: payload.userId,
    },
    select: {
      userId: true,
      username: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== 'active') {
    throw new UnauthorizedException(
      'Tài khoản không tồn tại hoặc không hoạt động',
    );
  }

  return {
    user: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
}
  // =====================================================
  // LOGOUT ALL DEVICES
  // =====================================================

  @Post('logout-all')
  @UseGuards(
    AuthGuard('jwt'),
  )
  @HttpCode(200)
  async logoutAll(

    @Req()
    req: Request,

    @Res({
      passthrough: true,
    })
    res: Response,

  ) {

    const user =
      req.user as UserEntity;


    // =================================================
    // REVOKE ALL REFRESH TOKENS
    // =================================================

    await this.refreshTokenRepo
      .createQueryBuilder()
      .update(
        RefreshTokenEntity,
      )
      .set({

        revokedAt:
          new Date(),

      })
      .where(

        '"user_id" = :userId',

        {

          userId:
            user.userId,

        },

      )
      .andWhere(
        '"revoked_at" IS NULL',
      )
      .execute();


    // =================================================
    // CLEAR CURRENT COOKIE
    // =================================================

    res.clearCookie(

      'refresh_token',

      {

        path:
          '/auth/refresh',

      },

    );


    return {

      message:
        'Logged out from all devices',

    };

  }

}