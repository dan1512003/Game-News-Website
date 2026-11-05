
import { inject, Injectable } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';

import {
  catchError,
  exhaustMap,
  map,
  of,
  switchMap,
} from 'rxjs';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

import { CommentService } from './services/comment.service';

import * as CommentActions from './comment.actions';

// Chuyển lỗi HTTP thành ApiErrorResponse
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
export class CommentEffects {
  private readonly actions$ = inject(Actions);
  private readonly commentService = inject(CommentService);

  // ===== Danh sách =====
  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadComments),
      switchMap(({ query }) =>
        this.commentService.getAll(query).pipe(
          map((response) =>
            CommentActions.loadCommentsSuccess({
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.loadCommentsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Chi tiết =====
  loadCommentById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadCommentById),
      switchMap(({ id }) =>
        this.commentService.getById(id).pipe(
          map((comment) =>
            CommentActions.loadCommentByIdSuccess({
              comment,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.loadCommentByIdFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Bình luận cha =====
  loadCommentParent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadCommentParent),
      switchMap(({ id }) =>
        this.commentService.getParent(id).pipe(
          map((parent) =>
            CommentActions.loadCommentParentSuccess({
              parent,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.loadCommentParentFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Duyệt =====
  approveComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.approveComment),
      exhaustMap(({ id }) =>
        this.commentService.approve(id).pipe(
          map((response) =>
            CommentActions.approveCommentSuccess({
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.approveCommentFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Từ chối =====
  rejectComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.rejectComment),
      exhaustMap(({ id }) =>
        this.commentService.reject(id).pipe(
          map((response) =>
            CommentActions.rejectCommentSuccess({
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.rejectCommentFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Xóa =====
  deleteComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.deleteComment),
      exhaustMap(({ id }) =>
        this.commentService.delete(id).pipe(
          map((response) =>
            CommentActions.deleteCommentSuccess({
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.deleteCommentFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Dashboard stats =====
  loadCommentDashboardStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadCommentDashboardStats),
      exhaustMap(() =>
        this.commentService.getDashboardStats().pipe(
          map((stats) =>
            CommentActions.loadCommentDashboardStatsSuccess({
              stats,
            }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.loadCommentDashboardStatsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
