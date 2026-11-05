
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
  switchMap,
} from 'rxjs';



import { NewsPublicService } from '../services/news-public.service';

import * as NewsPublicActions from './news-public.actions';
import { ApiErrorResponse } from '../../../shared/models/auth/auth.model';


function toApiError(error: unknown): ApiErrorResponse {
  if (error instanceof HttpErrorResponse) {
    // Không kết nối được Backend
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
export class NewsPublicEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(NewsPublicService);

  // ===== Load listing =====
  loadListing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadPublicListing),
      mergeMap(({ query }) =>
        this.service.getPublicListing(query).pipe(
          map((response) =>
            NewsPublicActions.loadPublicListingSuccess({
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              NewsPublicActions.loadPublicListingFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Search =====
  search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.searchPublicNews),
      mergeMap(({ query }) =>
        this.service.searchPublicNews(query).pipe(
          map((response) =>
            NewsPublicActions.searchPublicNewsSuccess({
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              NewsPublicActions.searchPublicNewsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Trending =====
  trending$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadTrendingNews),
      mergeMap(({ limit }) =>
        this.service.getTrending(limit ?? 5).pipe(
          map((items) =>
            NewsPublicActions.loadTrendingNewsSuccess({
              items,
            }),
          ),
          catchError((error: unknown) =>
            of(
              NewsPublicActions.loadTrendingNewsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Detail =====
  detail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadPublicNewsDetail),
      mergeMap(({ id }) =>
        this.service.getDetail(id).pipe(
          map((item) =>
            NewsPublicActions.loadPublicNewsDetailSuccess({
              item,
            }),
          ),
          catchError((error: unknown) =>
            of(
              NewsPublicActions.loadPublicNewsDetailFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Related =====
  related$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadRelatedNews),
      mergeMap(({ id, page, limit }) =>
        this.service.getRelated(
          id,
          page ?? 1,
          limit ?? 6,
        ).pipe(
          map((response) =>
            NewsPublicActions.loadRelatedNewsSuccess({
              response,
            }),
          ),
          catchError((error: unknown) =>
            of(
              NewsPublicActions.loadRelatedNewsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Breaking News =====
  loadBreakingNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadBreakingNews),
      switchMap(() =>
        this.service.getPublicListing({
          page: 1,
          limit: 10,
        }).pipe(
          map((response) =>
            NewsPublicActions.loadBreakingNewsSuccess({
              items: response.items,
            }),
          ),
          catchError((error: unknown) =>
            of(
              NewsPublicActions.loadBreakingNewsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
