import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';

import { CommentsPublicService } from '../services/comments-public.service';
import * as CommentsActions from './comments-public.actions';

@Injectable()
export class CommentsPublicEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(CommentsPublicService);

  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.loadComments),
      mergeMap(({ newsId, sortBy }) =>
        this.service.findByNews(newsId, sortBy ?? 'newest').pipe(
          map((comments) =>
            CommentsActions.loadCommentsSuccess({ newsId, comments }),
          ),
          catchError((error: unknown) =>
            of(CommentsActions.loadCommentsFailure({
              error: this.errorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  createComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.createComment),
      mergeMap(({ newsId, dto }) =>
        this.service.create(newsId, dto).pipe(
          map((response) =>
            CommentsActions.createCommentSuccess({ newsId, response }),
          ),
          catchError((error: unknown) =>
            of(CommentsActions.createCommentFailure({
              error: this.errorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  toggleLike$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.toggleCommentLike),
      mergeMap(({ newsId, commentId, sortBy }) =>
        this.service.toggleLike(newsId, commentId, sortBy ?? 'newest').pipe(
          map((response) =>
            CommentsActions.toggleCommentLikeSuccess({ newsId, response }),
          ),
          catchError((error: unknown) =>
            of(CommentsActions.toggleCommentLikeFailure({
              error: this.errorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? error.message ?? 'Có lỗi xảy ra';
    }
    return error instanceof Error ? error.message : 'Có lỗi xảy ra';
  }
}
