
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';

@Injectable()
export class ParseFormDataInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const body = request.body as Record<string, unknown> | undefined;

    if (!body || typeof body !== 'object') {
      return next.handle();
    }

    // Parse các trường JSON.
    for (const field of ['tagIds', 'contentBlocks']) {
      const current = body[field];

      if (typeof current === 'string') {
        try {
          body[field] = JSON.parse(current);
        } catch {
          // Giữ nguyên để ValidationPipe kiểm tra.
        }
      }
    }

    // Chuyển các trường số.
    for (const field of ['categoryId', 'views', 'reviewScore']) {
      const current = body[field];

      if (
        typeof current === 'string' &&
        current.trim() !== ''
      ) {
        const parsed = Number(current);

        if (Number.isFinite(parsed)) {
          body[field] = parsed;
        }
      }
    }

    // Chuẩn hóa ID dạng chuỗi.
    for (const field of ['authorId', 'reviewerId']) {
      if (body[field] === '') {
        body[field] = undefined;
      }
    }

    // Chuẩn hóa các trường ngày tùy chọn.
    for (const field of ['publishedAt', 'scheduledAt']) {
      if (body[field] === '') {
        body[field] = undefined;
      }
    }

    // Chuẩn hóa các trường tùy chọn khác.
    for (const field of [
      'summary',
      'thumbnail',
      'editorNote',
      'requirementNote',
    ]) {
      if (body[field] === '') {
        body[field] = undefined;
      }
    }

    return next.handle();
  }
}

