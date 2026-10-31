import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from '@nestjs/jwt';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { Notification } from './entities/notification.entity.js';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
import { NotificationGateway } from './notification.gateway.js';

import { UserEntity } from '../users/entities/user.entity/user.entity.js';

import { WebSocketJwtStrategy } from './strategies/websocket-jwt.strategy.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { NewsView } from './entities/news-view.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      UserEntity,
         NewsView,
    ]),

    ConfigModule,

    JwtModule.registerAsync({
      imports: [
        ConfigModule,
      ],
      inject: [
        ConfigService,
      ],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>(
          'WS_JWT_SECRET',
        );

        if (!secret) {
          throw new Error(
            'WS_JWT_SECRET chưa được cấu hình',
          );
        }

        return {
          secret,
        };
      },
    }),
  ],

  controllers: [
    NotificationController,
  ],

  providers: [
    NotificationService,
    NotificationGateway,
    WebSocketJwtStrategy,

    JwtAuthGuard,
    RolesGuard,
  ],

  exports: [
    NotificationService,
    NotificationGateway,
  ],
})
export class NotificationModule {}