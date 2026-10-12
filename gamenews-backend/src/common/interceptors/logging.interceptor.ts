
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, body } = request;
    const startTime = Date.now();

    this.logger.log(`REQUEST: ${method} ${originalUrl}`);
    this.logger.debug(`BODY: ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap((response) => {
        this.logger.log(
          `SUCCESS: ${method} ${originalUrl} | ` +
          `Time: ${Date.now() - startTime}ms`,
        );

        this.logger.debug(
          `RESPONSE: ${JSON.stringify(response)}`,
        );
      }),

      catchError((error) => {
        this.logger.error(
          `ERROR: ${method} ${originalUrl} | ` +
          `Status: ${error.status || 500} | ` +
          `Message: ${error.message}`,
          error.stack,
        );

        return throwError(() => error);
      }),
    );
  }
}