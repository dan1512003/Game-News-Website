import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import type {
  StrategyOptionsWithRequest,
} from 'passport-jwt';

import {
  ConfigService,
} from '@nestjs/config';


@Injectable()
export class JwtRefreshStrategy
  extends PassportStrategy(
    Strategy,
    'jwt-refresh',
  ) {

  constructor(
    private readonly configService:
      ConfigService,
  ) {

    const options:
      StrategyOptionsWithRequest = {

      jwtFromRequest:
        ExtractJwt.fromExtractors([

          (req) =>
            req?.cookies?.[
              'refresh_token'
            ] ?? null,

        ]),

      secretOrKey:
        configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),

      passReqToCallback:
        true,

    };


    super(options);
  }


  async validate(
    req: any,

    payload: {
      sub: string;
      email: string;
      jti?: string;
      type?: string;
    },
  ) {

    // =================================================
    // 1. GET REFRESH TOKEN FROM COOKIE
    // =================================================

    const refreshToken =
      req.cookies?.[
        'refresh_token'
      ];


    if (!refreshToken) {

      throw new UnauthorizedException(
        'Refresh token missing',
      );

    }


    // =================================================
    // 2. CHECK TOKEN TYPE
    // =================================================

    if (
      payload.type &&
      payload.type !== 'refresh'
    ) {

      throw new UnauthorizedException(
        'Invalid refresh token',
      );

    }


    // =================================================
    // 3. CHECK USER ID
    // =================================================

    if (!payload.sub) {

      throw new UnauthorizedException(
        'Invalid refresh token',
      );

    }


    // =================================================
    // 4. RETURN
    // =================================================

    return {

      ...payload,

      refreshToken,

    };

  }
}