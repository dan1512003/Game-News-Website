
import {
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    {
      instrument: ObserveInstrument,
    },
  );

  app.use(cookieParser());

  // Phục vụ ảnh tĩnh từ thư mục uploads
  app.useStaticAssets(
    join(process.cwd(), 'uploads'),
    {
      prefix: '/uploads/',
    },
  );

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      exceptionFactory: (errors) => {
        console.log('🔥 VALIDATION ERRORS:', errors);

        return new BadRequestException({
          message: 'Validation failed',
          errors: errors.map((error) => ({
            field: error.property,
            messages: Object.values(
              error.constraints ?? {},
            ),
          })),
        });
      },
    }),
  );

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new LoggingInterceptor(),
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(),
  );

  const configService = app.get(ConfigService);

  const port =
    configService.get<number>('app.port') ?? 3000;

  await app.listen(port);
}

await bootstrap();

