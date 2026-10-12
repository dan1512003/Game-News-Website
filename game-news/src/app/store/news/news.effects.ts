
import { Injectable, inject } from '@angular/core';

import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';

import {
  catchError,
  exhaustMap,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';

import { NewsService } from './services/news.service';
import * as NewsActions from './news.actions';

import {
  NewsData,
  NewsActionResponse,
} from './models/news.model';

// ============================================================
// ERROR HANDLER
// ============================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as {
      message?: string | string[];
    } | null;

    if (Array.isArray(body?.message)) {
      return body.message.join(', ');
    }

    return (
      body?.message ??
      error.message ??
      'Đã xảy ra lỗi khi gọi API'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
}

@Injectable()
export class NewsEffects {
  private readonly actions$ = inject(Actions);
  private readonly newsService = inject(NewsService);

  // ============================================================
  // LOAD DASHBOARD STATS
  // ============================================================

  loadNewsDashboardStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.loadNewsDashboardStats),

      exhaustMap(() =>
        this.newsService.getDashboardStats().pipe(
          map((stats) =>
            NewsActions.loadNewsDashboardStatsSuccess({
              stats,
            }),
          ),

          catchError((error: unknown) =>
            of(
              NewsActions.loadNewsDashboardStatsFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ============================================================
  // LOAD LIST
  // ============================================================

  loadNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.loadNews),

      switchMap(({ query }) =>
        this.newsService.getAll(query).pipe(
          map((response) =>
            NewsActions.loadNewsSuccess({
              response,
            }),
          ),

          catchError((error: unknown) =>
            of(
              NewsActions.loadNewsFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ============================================================
  // LOAD DETAIL
  // ============================================================

  loadNewsById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.loadNewsById),

      switchMap(({ id }) =>
        this.newsService.getById(id).pipe(
          map((news) =>
            NewsActions.loadNewsByIdSuccess({
              news,
            }),
          ),

          catchError((error: unknown) =>
            of(
              NewsActions.loadNewsByIdFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ============================================================
  // CREATE
  // ============================================================

  createNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.createNews),

      mergeMap(({ dto, file, blockImages }) =>
        this.newsService
          .create(dto, file, blockImages)
          .pipe(
            map((news) =>
              NewsActions.createNewsSuccess({
                news,
              }),
            ),

            catchError((error: unknown) =>
              of(
                NewsActions.createNewsFailure({
                  error: getErrorMessage(error),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  // ============================================================
  // UPDATE
  // ============================================================

  updateNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.updateNews),

      mergeMap(({ id, dto, file, blockImages }) =>
        this.newsService
          .update(id, dto, file, blockImages)
          .pipe(
            map((news) =>
              NewsActions.updateNewsSuccess({
                news,
              }),
            ),

            catchError((error: unknown) =>
              of(
                NewsActions.updateNewsFailure({
                  error: getErrorMessage(error),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  // ============================================================
  // DELETE
  // ============================================================

  deleteNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsActions.deleteNews),

      mergeMap(({ id }) =>
        this.newsService.delete(id).pipe(
          map((response: NewsActionResponse) =>
            NewsActions.deleteNewsSuccess({
              id,
              response,
            }),
          ),

          catchError((error: unknown) =>
            of(
              NewsActions.deleteNewsFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ============================================================
  // WORKFLOW ACTIONS
  // ============================================================

  workflow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        NewsActions.applyNews,
        NewsActions.publishNews,
        NewsActions.submitNews,
        NewsActions.unsubmitNews,
        NewsActions.returnNewsToAuthor,
        NewsActions.requireNewsEdit,
        NewsActions.unrequireNewsEdit,
        NewsActions.scheduleNews,
        NewsActions.unscheduleNews,
        NewsActions.unpublishNews,
      ),

      mergeMap((action) => {
        let request;

        switch (action.type) {
          // ----------------------------------------------------
          // APPLY
          // ----------------------------------------------------

          case NewsActions.applyNews.type:
            request = this.newsService.apply(action.id);
            break;

          // ----------------------------------------------------
          // PUBLISH
          // ----------------------------------------------------

          case NewsActions.publishNews.type:
            request = this.newsService.publish(action.id);
            break;

          // ----------------------------------------------------
          // SUBMIT
          // ----------------------------------------------------

          case NewsActions.submitNews.type:
            request = this.newsService.submit(action.id);
            break;

          // ----------------------------------------------------
          // UNSUBMIT
          // ----------------------------------------------------

          case NewsActions.unsubmitNews.type:
            request = this.newsService.unsubmit(action.id);
            break;

          // ----------------------------------------------------
          // RETURN TO AUTHOR
          // ----------------------------------------------------

          case NewsActions.returnNewsToAuthor.type: {
            const a = action as ReturnType<
              typeof NewsActions.returnNewsToAuthor
            >;

            request = this.newsService.returnToAuthor(
              a.id,
              a.dto,
            );
            break;
          }

          // ----------------------------------------------------
          // REQUIRE EDIT
          // ----------------------------------------------------

          case NewsActions.requireNewsEdit.type: {
            const a = action as ReturnType<
              typeof NewsActions.requireNewsEdit
            >;

            request = this.newsService.requireEdit(
              a.id,
              a.dto,
            );
            break;
          }

          // ----------------------------------------------------
          // UNREQUIRE EDIT
          // ----------------------------------------------------

          case NewsActions.unrequireNewsEdit.type:
            request = this.newsService.unrequire(action.id);
            break;

          // ----------------------------------------------------
          // SCHEDULE
          // ----------------------------------------------------

          case NewsActions.scheduleNews.type: {
            const a = action as ReturnType<
              typeof NewsActions.scheduleNews
            >;

            request = this.newsService.schedule(
              a.id,
              a.dto,
            );
            break;
          }

          // ----------------------------------------------------
          // UNSCHEDULE
          // ----------------------------------------------------

          case NewsActions.unscheduleNews.type:
            request = this.newsService.unschedule(action.id);
            break;

          // ----------------------------------------------------
          // UNPUBLISH
          // ----------------------------------------------------

          case NewsActions.unpublishNews.type:
            request = this.newsService.unpublish(action.id);
            break;

          // ----------------------------------------------------
          // INVALID ACTION
          // ----------------------------------------------------

          default:
            return of(
              NewsActions.newsWorkflowFailure({
                error: 'Thao tác bài viết không hợp lệ',
              }),
            );
        }

        // ------------------------------------------------------
        // EXECUTE WORKFLOW REQUEST
        // ------------------------------------------------------

        return request.pipe(
          map((news: NewsData) =>
            NewsActions.newsWorkflowSuccess({
              news,
              message: 'Thao tác bài viết thành công',
            }),
          ),

          catchError((error: unknown) =>
            of(
              NewsActions.newsWorkflowFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    ),
  );
}

