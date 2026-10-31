import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity/user.entity.js';

const ALLOWED_ROLES = [
  'admin',
  'super_admin',
  'editor',
  'author',
];

@Injectable()
export class WebSocketJwtStrategy {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async validate(token: string): Promise<UserEntity> {
    const secret = this.configService.get<string>(
      'WS_JWT_SECRET',
    );

    if (!secret) {
      throw new UnauthorizedException(
        'WS_JWT_SECRET chưa được cấu hình',
      );
    }

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException(
        'WebSocket token không hợp lệ hoặc đã hết hạn',
      );
    }

    if (
      payload.purpose !== 'dashboard_socket' ||
      !payload.sub
    ) {
      throw new UnauthorizedException(
        'WebSocket token không hợp lệ',
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        userId: payload.sub as UserEntity['userId'],
      },
    });

    if (
      !user ||
      user.status !== 'active' ||
      !ALLOWED_ROLES.includes(user.role) ||
      String(user.userId) !== String(payload.sub)
    ) {
      throw new UnauthorizedException(
        'Bạn không có quyền truy cập Dashboard',
      );
    }

    return user;
  }
}