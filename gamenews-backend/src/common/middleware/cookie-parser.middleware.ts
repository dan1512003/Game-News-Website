import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import {
  Request,
  Response,
  NextFunction,
} from 'express';

import cookieParser from 'cookie-parser';


@Injectable()
export class CookieParserMiddleware
  implements NestMiddleware {

  private readonly parser =
    cookieParser();


  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {

    this.parser(
      req,
      res,
      next,
    );

  }

}