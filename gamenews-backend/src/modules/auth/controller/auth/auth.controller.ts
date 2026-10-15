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
  Patch,
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
import { ResetPasswordDto } from '../../dto/password-reset.dto/reset-password.dto.js';
import { VerifyPasswordResetOtpDto } from '../../dto/password-reset.dto/verify-password-reset-otp.dto.js';
import { RequestPasswordResetDto } from '../../dto/password-reset.dto/request-password-reset.dto.js';
import { SendEmailResetOtpDto } from '../../dto/email-reset.dto/send-email-reset-otp.dto.js';
import { ResetEmailDto } from '../../dto/email-reset.dto/reset-email.dto.js';
import { UpdateUsernameDto } from '../../../users/dto/update-username.dto/update-username.dto.js';
import { ChangePasswordDto } from '../../../users/dto/change-password.dto/change-password.dto.js';


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
    @Req() req: Request,
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
    const deviceName =
    req.headers['user-agent'] ?? null;

  const result = await this.authService.login(dto,deviceName,  req.ip ?? null,);

  // =====================================================
  // SET REFRESH TOKEN COOKIE
  // =====================================================

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production',

    sameSite: 'strict',

    path: '/auth',

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
  console.log(
    '\n========== REFRESH START ==========');

  try {
     const payload = req.user as  any;
    // ================================================
    // 1. GET REFRESH TOKEN FROM COOKIE
    // ================================================

    const refreshToken =payload.refreshToken;

    console.log('[1] Cookie exists:', !!refreshToken);


    const userId = payload.id;

    console.log('[2] User ID:', userId);
  

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
          path: '/auth',
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
        path: '/auth',
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
          expiresIn: storedToken.rememberMe ? '30d' : '1d'
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
const durationMs = storedToken.rememberMe
  ? 30 * 24 * 60 * 60 * 1000
  : 24 * 60 * 60 * 1000;
    await this.refreshTokenRepo.insert({
      userId: String(user.userId),
      jti: newRefreshJti,
      tokenHash: newTokenHash,
      familyId: storedToken.familyId,
      rememberMe:storedToken.rememberMe,
      expiresAt:  new Date(Date.now() + durationMs),
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
        path: '/auth',
        maxAge: storedToken.rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000
      },
    );

  

    console.log('[SUCCESS] Refresh completed');
    console.log('========== REFRESH END ==========\n');

    return {
      message: 'Refresh successful',

      accessToken: newAccessToken,

      user: {
      userId: user.userId,
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
@UseGuards(AuthGuard('jwt'))
@HttpCode(200)
async logout(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  console.log('========== LOGOUT ==========');

  const user = req.user as UserEntity;

  console.log('User ID:', user?.userId);

  // REVOKE CURRENT REFRESH TOKEN
  const refreshToken = req.cookies?.['refresh_token'];

  console.log('Refresh token exists:', !!refreshToken);

  if (refreshToken) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    console.log('Refresh token hash:', tokenHash);

    await this.refreshTokenRepo.update(
      {
        userId: user.userId,
        tokenHash,
      },
      {
        revokedAt: new Date(),
      },
    );

    console.log('Refresh token revoked');
  } else {
    console.log('No refresh token found in cookies');
  }

  const authHeader = req.headers.authorization;

  console.log('Authorization header exists:', !!authHeader);

  if (authHeader) {
    const accessToken = authHeader.split(' ')[1];

    const payload = this.jwtService.decode(accessToken) as any;

    console.log('Access token payload:', payload);

    if (payload?.jti) {
      const exp = payload.exp - Math.floor(Date.now() / 1000);

      console.log('Access token JTI:', payload.jti);
      console.log('Access token remaining seconds:', exp);

      await this.authService.blacklistAccessToken(
        payload.jti,
        Math.max(exp, 0),
      );

      console.log('Access token blacklisted');
    } else {
      console.log('Access token has no JTI');
    }
  }

  // CLEAR COOKIE
  res.clearCookie(
    'refresh_token',
    {
      path: '/auth',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  );

  console.log('Refresh token cookie cleared');
  console.log('========== LOGOUT COMPLETE ==========');

  return {
    message: 'Logged out successfully',
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
// 1. SEND EMAIL RESET OTP
// POST /auth/email-reset/send-otp
// =====================================================

@Post('email-reset/send-otp')
@UseGuards(
    AuthGuard('jwt'),
  )
@HttpCode(200)
async sendEmailResetOtp(
@Body() dto: SendEmailResetOtpDto,
) {
return this.authService.sendEmailResetOtp(dto);
}

// =====================================================
// 2. VERIFY OTP AND RESET EMAIL
// POST /auth/email-reset/verify
// =====================================================

// =====================================================
// 2. VERIFY OTP AND RESET EMAIL
// POST /auth/email-reset/verify
// =====================================================

@Post('email-reset/verify')
@UseGuards(
    AuthGuard('jwt'),
  )
@HttpCode(200)
async resetEmail(
  @Req() req: Request,
  @Body() dto: ResetEmailDto,
  @Res({ passthrough: true }) res: Response,
) {
   const userauth = req.user as UserEntity;
  console.log('[Controller] START resetEmail');

  const user = (await this.authService.resetEmail(userauth.userId,dto)).user;

  console.log('[Controller] User:', user);

  const refreshToken =
    req.cookies?.['refresh_token'];

  console.log(
    '[Controller] refreshToken:',
    !!refreshToken,
  );

  if (!refreshToken) {
    console.log('[Controller] ERROR: no refreshToken');

    throw new UnauthorizedException(
      'Refresh token reuse detected — all sessions invalidated',
    );
  }

  const tokenHash =
    crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

  console.log('[Controller] tokenHash created');

  const storedToken =
    await this.refreshTokenRepo.findOne({
      where: {
        userId: user.userId,
        tokenHash
      },
    });

  console.log(
    '[Controller] storedToken:',
    !!storedToken,
  );

  if (!storedToken) {
    console.log('[Controller] ERROR: storedToken not found');

    throw new UnauthorizedException(
      'Refresh token reuse detected — all sessions invalidated',
    );
  }

  const remember = storedToken.rememberMe;

  console.log('[Controller] remember:', remember);

  await this.refreshTokenRepo.update(
    {
      userId: user.userId,
      tokenHash,
    },
    {
      revokedAt: new Date(),
    },
  );

  console.log('[Controller] refreshToken revoked');

  const authHeader = req.headers.authorization;

  console.log(
    '[Controller] authorization:',
    !!authHeader,
  );

  if (authHeader) {
    const accessToken = authHeader.split(' ')[1];

    const payload =
      this.jwtService.decode(accessToken) as any;

    console.log('[Controller] payload:', payload);

    if (payload?.jti) {
      const exp =
        payload.exp -
        Math.floor(Date.now() / 1000);

      await this.authService.blacklistAccessToken(
        payload.jti,
        Math.max(exp, 0),
      );

      console.log('[Controller] accessToken blacklisted');
    }
  }

  res.clearCookie(
    'refresh_token',
    {
      path: '/auth',
    },
  );

  console.log('[Controller] cookie cleared');

  const deviceName =
    req.headers['user-agent'] ?? null;

const result= await this.authService.issueTokens(
    user,
    remember,
    deviceName,
    req.ip ?? null
  );
 res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production',

    sameSite: 'strict',

    path: '/auth',

    maxAge: Math.max(
      result.refreshExpiresAt.getTime() - Date.now(),
      0,
    ),
  });

  return {
    user: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    message:
      'Reset Email successfully',
  };
}

@Post('password-reset/request')
@HttpCode(200)
async requestPasswordReset(
@Body() dto: RequestPasswordResetDto,
) {
return this.authService.requestPasswordReset(dto);
}

// =====================================================
// 4. VERIFY PASSWORD RESET OTP
// POST /auth/password-reset/verify
// =====================================================
@Post('password-reset/verify')
@HttpCode(200)
async verifyPasswordResetOtp(
  @Req() req: Request,
  @Body() dto: VerifyPasswordResetOtpDto,
  @Res({ passthrough: true }) res: Response,
) {
  console.log('\n');
  console.log('####################################################');
  console.log('POST /auth/password-reset/verify');
  console.log('####################################################');

  console.log('[Controller] Body:', {
    email: dto.email,
    sessionId: dto.sessionId,
    otpLength: dto.otp?.length ?? 0,
  });

  console.log(
    '[Controller] Cookies received:',
    Object.keys(req.cookies ?? {}),
  );

  const currentResetToken =
    req.cookies?.['reset_password_token'];

  console.log(
    '[Controller] reset_password_token:',
    {
      exists: !!currentResetToken,
      length:
        currentResetToken?.length ?? 0,
    },
  );

  console.log(
    '[Controller] Calling service...',
  );

  const result =
    await this.authService.verifyPasswordResetOtp(
      dto,
      currentResetToken,
    );

  console.log(
    '[Controller] Service returned:',
    {
      message: result.message,
      hasResetToken:
        !!result.resetToken,
      resetTokenLength:
        result.resetToken?.length ?? 0,
      expireResetTokenAt:
        result.expireResetTokenAt,
    },
  );

  if (result.resetToken) {
    console.log(
      '[Controller] NEW reset token detected',
    );

    const maxAge = Math.max(
      result.expireResetTokenAt.getTime() -
        Date.now(),
      0,
    );

    console.log(
      '[Controller] Cookie maxAge:',
      maxAge,
    );

    if (maxAge > 0) {
      res.cookie(
        'reset_password_token',
        result.resetToken,
        {
          httpOnly: true,

          secure:
            process.env.NODE_ENV ===
            'production',

          sameSite: 'strict',

          path:
            '/auth/password-reset',

          maxAge,
        },
      );

      console.log(
        '[Controller] reset_password_token COOKIE SET',
      );

      console.log(
        '[Controller] Cookie config:',
        {
          httpOnly: true,

          secure:
            process.env.NODE_ENV ===
            'production',

          sameSite: 'strict',

          path:
            '/auth/password-reset',

          maxAge,
        },
      );
    } else {
      console.warn(
        '[Controller] maxAge <= 0, cookie NOT SET',
      );
    }
  } else {
    console.log(
      '[Controller] No new reset token returned',
    );

    console.log(
      '[Controller] Existing reset cookie should remain valid',
    );
  }

  console.log(
    '[Controller] Returning response WITHOUT reset token',
  );

  console.log(
    '####################################################',
  );
  console.log(
    'POST /auth/password-reset/verify - END',
  );
  console.log(
    '####################################################\n',
  );

  return {
    message:
      result.message,
  };
}

// =====================================================
// 5. RESET PASSWORD
// POST /auth/password-reset/reset
// =====================================================

@Post('password-reset/reset')
@HttpCode(200)
async resetPassword(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
  @Body() dto: ResetPasswordDto,
) {
  console.log('\n');
  console.log('####################################################');
  console.log('POST /auth/password-reset/reset');
  console.log('####################################################');

  console.log(
    '[Controller] Body:',
    {
      email: dto.email,
      sessionId: dto.sessionId,
      newPasswordLength:
        dto.newPassword?.length ?? 0,
      confirmPasswordLength:
        dto.confirmPassword?.length ?? 0,
    },
  );

  console.log(
    '[Controller] All cookies:',
    Object.keys(req.cookies ?? {}),
  );

  // =====================================================
  // 1. GET RESET TOKEN
  // =====================================================

  const resetToken =
    req.cookies?.['reset_password_token'];

  console.log(
    '[Controller] reset_password_token:',
    {
      exists: !!resetToken,
      length:
        resetToken?.length ?? 0,
    },
  );

  if (!resetToken) {
    console.error(
      '[Controller] RESET COOKIE NOT FOUND',
    );

    throw new UnauthorizedException(
      'Reset token không tồn tại hoặc đã hết hạn',
    );
  }

  // =====================================================
  // 2. CALL SERVICE
  // =====================================================

  console.log(
    '[Controller] Calling resetPassword service...',
  );

  const result =
    await this.authService.resetPassword(
      dto,
      resetToken,
    );

  console.log(
    '[Controller] resetPassword service SUCCESS:',
    {
      message:
        result.message,

      user:
        result.user,
    },
  );

  const user = result.user;

  // =====================================================
  // 3. REFRESH TOKEN
  // =====================================================

  const refreshToken =
    req.cookies?.['refresh_token'];

  console.log(
    '[Controller] refresh_token:',
    {
      exists: !!refreshToken,
      length:
        refreshToken?.length ?? 0,
    },
  );

  if (refreshToken) {

    const tokenHash =
      crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    console.log(
      '[Controller] Refresh token hash:',
      tokenHash,
    );

    console.log(
      '[Controller] Revoking refresh token...',
    );

    const updateResult =
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

    console.log(
      '[Controller] Refresh token revoke result:',
      {
        affected:
          updateResult.affected,
      },
    );

  } else {

    console.log(
      '[Controller] No refresh token found',
    );
  }

  // =====================================================
  // 4. ACCESS TOKEN
  // =====================================================

  const authHeader =
    req.headers.authorization;

  console.log(
    '[Controller] Authorization header:',
    {
      exists: !!authHeader,

      isBearer:
        authHeader?.startsWith(
          'Bearer ',
        ) ?? false,
    },
  );

  if (
    authHeader?.startsWith('Bearer ')
  ) {
    const accessToken =
      authHeader.substring(7);

    console.log(
      '[Controller] Access token received:',
      {
        length:
          accessToken.length,
      },
    );

    const payload =
      this.jwtService.decode(accessToken) as
        | {
            jti?: string;
            exp?: number;
          }
        | null;

    console.log(
      '[Controller] Decoded access token:',
      {
        exists:
          !!payload,

        jti:
          payload?.jti,

        exp:
          payload?.exp,

        expiresAt:
          payload?.exp
            ? new Date(
                payload.exp * 1000,
              )
            : null,
      },
    );

    if (
      payload?.jti &&
      payload.exp
    ) {
      const remainingSeconds =
        payload.exp -
        Math.floor(
          Date.now() / 1000,
        );

      console.log(
        '[Controller] Access token remaining:',
        remainingSeconds,
        'seconds',
      );

      if (
        remainingSeconds > 0
      ) {
        console.log(
          '[Controller] Blacklisting access token...',
        );

        await this.authService.blacklistAccessToken(
          payload.jti,
          remainingSeconds,
        );

        console.log(
          '[Controller] Access token BLACKLISTED',
        );
      } else {
        console.log(
          '[Controller] Access token already expired',
        );
      }
    } else {
      console.warn(
        '[Controller] Access token missing jti or exp',
      );
    }
  } else {
    console.log(
      '[Controller] No Bearer access token',
    );
  }

  // =====================================================
  // 5. CLEAR RESET COOKIE
  // =====================================================

  console.log(
    '[Controller] Clearing reset_password_token...',
  );

  res.clearCookie(
    'reset_password_token',
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        'production',

      sameSite: 'strict',

      path:
        '/auth/password-reset',
    },
  );

  console.log(
    '[Controller] reset_password_token CLEAR SENT',
  );

  // =====================================================
  // 6. CLEAR REFRESH COOKIE
  // =====================================================

  if (refreshToken) {
    console.log(
      '[Controller] Clearing refresh_token...',
    );

    res.clearCookie(
      'refresh_token',
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          'production',

        sameSite: 'strict',

        path: '/auth',
      },
    );

    console.log(
      '[Controller] refresh_token CLEAR SENT',
    );
  }

  // =====================================================
  // 7. RESPONSE
  // =====================================================

  console.log(
    '[Controller] PASSWORD RESET SUCCESS',
  );

  console.log(
    '[Controller] Final user:',
    {
      userId:
        user.userId,

      username:
        user.username,

      email:
        user.email,

      role:
        user.role,

      status:
        user.status,
    },
  );

  console.log(
    '####################################################',
  );
  console.log(
    'POST /auth/password-reset/reset - END',
  );
  console.log(
    '####################################################\n',
  );

  return {
    message:
      'Reset password successfully',
  };
}
// =====================================================
// 1. ĐỔI USERNAME
// PATCH /auth/username
// =====================================================

@Patch('username')
@UseGuards(AuthGuard('jwt'))
@HttpCode(200)
async updateUsername(
   @Req() req: Request,
  @Body() dto: UpdateUsernameDto,
) {
    const user = req.user as UserEntity;
  return this.authService.updateUsername(user.userId,dto);
}

// =====================================================
// 2. ĐỔI MẬT KHẨU
// PATCH /auth/password
// =====================================================

@Patch('password')
@UseGuards(AuthGuard('jwt'))
@HttpCode(200)
async changePassword(
   @Req() req: Request,
 @Res({ passthrough: true }) res: Response,
  @Body() dto: ChangePasswordDto,
) {
  const userauth = req.user as UserEntity;
  console.log('[Controller] START resetEmail');
  const user= (await this.authService.changePassword(userauth.userId,dto)).user;


//thu hồi token hiện tại

    const refreshToken =
      req.cookies?.[
        'refresh_token'
      ];


   if(!refreshToken){
        throw new UnauthorizedException(
          'Refresh token reuse detected — all sessions invalidated',
        );
      }

      const tokenHash =
        crypto
          .createHash('sha256')
          .update(refreshToken)
          .digest('hex');

    const storedToken =
      await this.refreshTokenRepo.findOne({
        where: {
        userId:user.userId,
       tokenHash
        },
      })
      if(!storedToken){
        throw new UnauthorizedException(
          'Refresh token reuse detected — all sessions invalidated',
        );
      }
       const remember =storedToken.rememberMe

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

  

  const authHeader = req.headers.authorization;
 if (authHeader) {
   const accessToken = authHeader.split(' ')[1];
   const payload = this.jwtService.decode(accessToken) as any;
   if (payload?.jti) {   
     const exp = payload.exp - Math.floor(Date.now() / 1000);
    await this.authService.blacklistAccessToken(payload.jti, Math.max(exp, 0));

   }
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

    //cấp lại token và refresh mới
 console.log('[Controller] cookie cleared');

  const deviceName =
    req.headers['user-agent'] ?? null;
    
 const result= await this.authService.issueTokens(
    user,
    remember,
    deviceName,
    req.ip ?? null
  );
 res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production',

    sameSite: 'strict',

    path: '/auth',

    maxAge: Math.max(
      result.refreshExpiresAt.getTime() - Date.now(),
      0,
    ),
  });
    return {
      user:
result.user,
      message:
        'Reset Email successfully',

    };
}


}