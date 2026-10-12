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

import { CommentService } from './services/comment.service';
import * as CommentActions from './comment.actions'

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.message;

    return Array.isArray(message)
      ? message.join(', ')
      : message ?? error.message ?? 'Đã xảy ra lỗi khi gọi API';
  }

  return error instanceof Error
    ? error.message
    : 'Đã xảy ra lỗi không xác định';
}

@Injectable()
export class CommentEffects {
  private readonly actions$ = inject(Actions);
  private readonly commentService = inject(CommentService);

  // Danh sách
  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadComments),
      switchMap(({ query }) =>
        this.commentService.getAll(query).pipe(
          map((response) =>
            CommentActions.loadCommentsSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.loadCommentsFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Chi tiết
  loadCommentById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadCommentById),
      switchMap(({ id }) =>
        this.commentService.getById(id).pipe(
          map((comment) =>
            CommentActions.loadCommentByIdSuccess({ comment }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.loadCommentByIdFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Bình luận cha
  loadCommentParent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadCommentParent),
      switchMap(({ id }) =>
        this.commentService.getParent(id).pipe(
          map((parent) =>
            CommentActions.loadCommentParentSuccess({ parent }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.loadCommentParentFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Duyệt
  approveComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.approveComment),
      exhaustMap(({ id }) =>
        this.commentService.approve(id).pipe(
          map((response) =>
            CommentActions.approveCommentSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.approveCommentFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Từ chối
  rejectComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.rejectComment),
      exhaustMap(({ id }) =>
        this.commentService.reject(id).pipe(
          map((response) =>
            CommentActions.rejectCommentSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.rejectCommentFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Xóa
  deleteComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.deleteComment),
      exhaustMap(({ id }) =>
        this.commentService.delete(id).pipe(
          map((response) =>
            CommentActions.deleteCommentSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(
              CommentActions.deleteCommentFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

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
              error: getErrorMessage(error),
            }),
          ),
        ),
      ),
    ),
  ),
);
}