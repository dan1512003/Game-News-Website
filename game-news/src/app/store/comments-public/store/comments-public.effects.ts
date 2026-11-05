
import { Injectable, inject } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';

import {
  catchError,
  map,
  mergeMap,
  of,
} from 'rxjs';



import { CommentsPublicService } from '../services/comments-public.service';

import * as CommentsActions from './comments-public.actions';
import { ApiErrorResponse } from '../../../shared/models/auth/auth.model';


function toApiError(error: unknown): ApiErrorResponse {
  if (error instanceof HttpErrorResponse) {
    // Backend không kết nối được
    if (error.status === 0) {
      return {
        statusCode: 0,
        message: 'Không thể kết nối đến máy chủ.',
        timestamp: new Date().toISOString(),
        path: '',
      };
    }

    const body = error.error;
    const message = body?.message;

    let fallbackMessage = 'Đã xảy ra lỗi khi gọi API.';

    if (error.status === 401) {
      fallbackMessage =
        'Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập';
    } else if (error.status === 403) {
      fallbackMessage =
        'Bạn không có quyền thực hiện thao tác này';
    }

    return {
      statusCode:
        typeof body?.statusCode === 'number'
          ? body.statusCode
          : error.status,

      message: Array.isArray(message)
        ? message.join(', ')
        : typeof message === 'string'
          ? message
          : fallbackMessage,

      errors: Array.isArray(body?.errors)
        ? body.errors
        : undefined,

      timestamp:
        typeof body?.timestamp === 'string'
          ? body.timestamp
          : new Date().toISOString(),

      path:
        typeof body?.path === 'string'
          ? body.path
          : '',
    };
  }

  return {
    statusCode: 500,
    message:
      error instanceof Error
        ? error.message
        : 'Đã xảy ra lỗi không xác định.',
    timestamp: new Date().toISOString(),
    path: '',
  };
}

@Injectable()
export class CommentsPublicEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(CommentsPublicService);

  // ===== Load comments =====
  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.loadComments),
      mergeMap(({ newsId, sortBy }) =>
        this.service.findByNews(
          newsId,
          sortBy ?? 'newest',
        ).pipe(
          map((comments) =>
            CommentsActions.loadCommentsSuccess({
              newsId,
              comments,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentsActions.loadCommentsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Create comment =====
  createComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.createComment),
      mergeMap(({ newsId, dto }) =>
        this.service.create(newsId, dto).pipe(
          map((response) =>
            CommentsActions.createCommentSuccess({
              newsId,
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentsActions.createCommentFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Toggle like =====
  toggleLike$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.toggleCommentLike),
      mergeMap(({ newsId, commentId, sortBy }) =>
        this.service.toggleLike(
          newsId,
          commentId,
          sortBy ?? 'newest',
        ).pipe(
          map((response) =>
            CommentsActions.toggleCommentLikeSuccess({
              newsId,
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentsActions.toggleCommentLikeFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
