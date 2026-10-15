import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './controller/auth/auth.controller.js';
import { AuthService } from './service/auth/auth.service.js';

import { UserEntity } from '../users/entities/user.entity/user.entity.js';
import { RefreshTokenEntity } from './entities/refresh-token.entity/refresh-token.entity.js';

import { MailModule } from '../mail/mail.module.js';

import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';
import { EmailResetTokenEntity } from './entities/email-reset-token.entity/email-reset-token.entity.js';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity/password-reset-token.entity.js';
import { AccessTokenBlacklistEntity } from './entities/access-token-blacklist.entity/access-token-blacklist.entity.js';

@Module({
  imports: [
    ConfigModule,

    MailModule,

    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenEntity,
      EmailResetTokenEntity,
      PasswordResetTokenEntity,
      AccessTokenBlacklistEntity
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),

        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
   
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],

  exports: [
    AuthService,
  ],
})
export class AuthModule {}