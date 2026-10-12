import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx =
      host.switchToHttp();

    const response =
      ctx.getResponse<Response>();

    const request =
      ctx.getRequest();

    const timestamp =
      new Date().toISOString();


    // ================================================
    // HTTP EXCEPTION
    // ================================================

    if (
      exception instanceof HttpException
    ) {

      const status =
        exception.getStatus();

      const exceptionResponse =
        exception.getResponse();

      response
        .status(status)
        .json({

          statusCode:
            status,

          ...(typeof exceptionResponse ===
          'object'
            ? exceptionResponse
            : {
                message:
                  exceptionResponse,
              }),

          timestamp,

          path:
            request.url,

        });

      return;
    }


    // ================================================
    // UNKNOWN ERROR
    // ================================================

    console.error(
      '========================================',
    );

    console.error(
      'UNHANDLED ERROR:',
    );

    console.error(
      exception,
    );

    console.error(
      '========================================',
    );


    response
      .status(
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      .json({

        statusCode:
          500,

        message:
          exception instanceof Error
            ? exception.message
            : 'Internal server error',

        timestamp,

        path:
          request.url,

      });
  }
}