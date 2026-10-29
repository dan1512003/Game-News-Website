import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  catchError,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';

import { NewsPublicService } from '../services/news-public.service';
import * as NewsPublicActions from './news-public.actions';

@Injectable()
export class NewsPublicEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(NewsPublicService);

  
  loadListing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadPublicListing),
      mergeMap(({ query }) =>
        this.service.getPublicListing(query).pipe(
          map((response) =>
            NewsPublicActions.loadPublicListingSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(NewsPublicActions.loadPublicListingFailure({
              error: this.errorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.searchPublicNews),
      mergeMap(({ query }) =>
        this.service.searchPublicNews(query).pipe(
          map((response) =>
            NewsPublicActions.searchPublicNewsSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(NewsPublicActions.searchPublicNewsFailure({
              error: this.errorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  trending$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadTrendingNews),
      mergeMap(({ limit }) =>
        this.service.getTrending(limit ?? 5).pipe(
          map((items) =>
            NewsPublicActions.loadTrendingNewsSuccess({ items }),
          ),
          catchError((error: unknown) =>
            of(NewsPublicActions.loadTrendingNewsFailure({
              error: this.errorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  detail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadPublicNewsDetail),
      mergeMap(({ id }) =>
        this.service.getDetail(id).pipe(
          map((item) =>
            NewsPublicActions.loadPublicNewsDetailSuccess({ item }),
          ),
          catchError((error: unknown) =>
            of(NewsPublicActions.loadPublicNewsDetailFailure({
              error: this.errorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );

  related$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NewsPublicActions.loadRelatedNews),
      mergeMap(({ id, page, limit }) =>
        this.service.getRelated(id, page ?? 1, limit ?? 6).pipe(
          map((response) =>
            NewsPublicActions.loadRelatedNewsSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(NewsPublicActions.loadRelatedNewsFailure({
              error: this.errorMessage(error),
            })),
          ),
        ),
      ),
    ),
  );




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
              error: this.errorMessage(error),
            }),
          ),
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
