
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
  tap,
} from 'rxjs';

import { TagService } from './services/tag.service';
import * as TagActions from './tag.actions';

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
export class TagEffects {
  private readonly actions$ = inject(Actions);
  private readonly tagService = inject(TagService);

  // Toàn bộ tag options
  loadTagOptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.loadTagOptions),
      switchMap(() =>
        this.tagService.getOptions().pipe(
          map((options) =>
            TagActions.loadTagOptionsSuccess({ options }),
          ),
          catchError((error: unknown) =>
            of(
              TagActions.loadTagOptionsFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Danh sách + tìm kiếm + phân trang
  loadTags$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.loadTags),
      switchMap(({ query }) =>
        this.tagService.getAll(query).pipe(
          map((response) =>
            TagActions.loadTagsSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(
              TagActions.loadTagsFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Chi tiết
  loadTagById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.loadTagById),
      switchMap(({ id }) =>
        this.tagService.getById(id).pipe(
          map((tag) =>
            TagActions.loadTagByIdSuccess({ tag }),
          ),
          catchError((error: unknown) =>
            of(
              TagActions.loadTagByIdFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Tạo mới
  createTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.createTag),
      exhaustMap(({ dto }) =>
        this.tagService.create(dto).pipe(
          map((tag) => TagActions.createTagSuccess({ tag })),
          catchError((error: unknown) =>
            of(
              TagActions.createTagFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Cập nhật
  updateTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.updateTag),
      exhaustMap(({ id, dto }) =>
        this.tagService.update(id, dto).pipe(
          map((tag) => TagActions.updateTagSuccess({ tag })),
          catchError((error: unknown) =>
            of(
              TagActions.updateTagFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Xóa
  deleteTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.deleteTag),
      exhaustMap(({ id }) =>
        this.tagService.delete(id).pipe(
          map((response) =>
            TagActions.deleteTagSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(
              TagActions.deleteTagFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
  
loadTagDashboardStats$ = createEffect(() =>
  this.actions$.pipe(
    ofType(TagActions.loadTagDashboardStats),
    switchMap(() =>
      this.tagService.getDashboardStats().pipe(
        map((stats) =>
          TagActions.loadTagDashboardStatsSuccess({ stats }),
        ),
        catchError((error: unknown) =>
          of(
            TagActions.loadTagDashboardStatsFailure({
              error: getErrorMessage(error),
            }),
          ),
        ),
      ),
    ),
  ),
);
}