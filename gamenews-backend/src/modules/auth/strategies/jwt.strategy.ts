import {
Injectable,
UnauthorizedException,
Logger,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import {
ExtractJwt,
Strategy,
} from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity/user.entity.js';
import { AuthService } from '../service/auth/auth.service.js';


@Injectable()
export class JwtStrategy extends PassportStrategy(
Strategy,
'jwt',
) {
private readonly logger = new Logger('JwtStrategy');

constructor(
private readonly configService: ConfigService,


private readonly authService: AuthService,

@InjectRepository(UserEntity)
private readonly userRepository: Repository<UserEntity>,


) {
const secret = configService.get<string>(
'JWT_ACCESS_SECRET',
);


if (!secret) {
  Logger.error(
    'JWT_ACCESS_SECRET chưa được cấu hình',
    undefined,
    'JwtStrategy',
  );

  throw new Error(
    'JWT_ACCESS_SECRET chưa được cấu hình',
  );
}

super({
  jwtFromRequest:
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
  ignoreExpiration: false,
});

Logger.log(
  'JWT Strategy initialized successfully',
  'JwtStrategy',
);


}

async validate(payload: {
sub: string;
email: string;
username?: string;
role?: string;
jti?: string;
exp?: number;
type?: string;
}) {
try {
this.logger.debug(
`Validating JWT for userId=${payload.sub}`,
);


  // 1. Kiểm tra payload và loại token.
  if (
    !payload.sub ||
    !payload.jti ||
    !payload.exp ||
    payload.type !== 'access'
  ) {
    throw new UnauthorizedException(
      'Invalid access token',
    );
  }


  const expiresInSeconds =
    payload.exp - Math.floor(Date.now() / 1000);

  if (expiresInSeconds <= 0) {
    throw new UnauthorizedException(
      'Access token expired',
    );
  }

  // 3. Kiểm tra token có nằm trong blacklist không.
  const blacklisted =
    await this.authService.isBlacklisted(
      payload.jti,
    );

  if (blacklisted) {
    throw new UnauthorizedException(
      'Access token has been revoked',
    );
  }

  // 4. Tìm user.
  const user = await this.userRepository.findOne({
    where: {
      userId: payload.sub,
    },
  });

  if (!user) {
    throw new UnauthorizedException(
      'User not found',
    );
  }

  // 5. Kiểm tra trạng thái tài khoản.
  if (user.status !== 'active') {
    throw new UnauthorizedException(
      'User account is not active',
    );
  }

  this.logger.log(
    `JWT validation successful for userId=${payload.sub}`,
  );

  // Giữ nguyên cấu trúc req.user hiện tại.
  return user;
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  this.logger.error(
    `JWT validation failed: ${message}`,
    error instanceof Error
      ? error.stack
      : undefined,
  );

  throw error;
}


}
}
