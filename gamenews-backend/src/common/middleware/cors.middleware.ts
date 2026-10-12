import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import {
  Request,
  Response,
  NextFunction,
} from 'express';


@Injectable()
export class CorsMiddleware
  implements NestMiddleware {

  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {

    const origin =
      req.headers.origin;


    // =====================================================
    // ALLOWED ORIGINS
    // =====================================================

    const allowedOrigins = [
      'http://localhost:4200',
    ];


    // =====================================================
    // ALLOW ORIGIN
    // =====================================================

    if (
      origin &&
      allowedOrigins.includes(origin)
    ) {

      res.header(
        'Access-Control-Allow-Origin',
        origin,
      );

    }


    // =====================================================
    // CREDENTIALS
    // =====================================================

    res.header(
      'Access-Control-Allow-Credentials',
      'true',
    );


    // =====================================================
    // METHODS
    // =====================================================

    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );


    // =====================================================
    // HEADERS
    // =====================================================

    res.header(
      'Access-Control-Allow-Headers',
      [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
      ].join(', '),
    );


    // =====================================================
    // VARY
    // =====================================================

    res.header(
      'Vary',
      'Origin',
    );


    // =====================================================
    // PREFLIGHT
    // =====================================================

    if (
      req.method === 'OPTIONS'
    ) {

      res.sendStatus(204);

      return;

    }


    next();

  }

}