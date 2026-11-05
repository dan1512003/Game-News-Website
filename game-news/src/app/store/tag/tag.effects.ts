
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

import { TagService } from './services/tag.service';
import * as TagActions from './tag.actions';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

// Chuyển lỗi API thành ApiErrorResponse
function toApiError(error: unknown): ApiErrorResponse {
  if (error instanceof HttpErrorResponse) {
    // Backend tắt hoặc không thể kết nối
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

    return {
      statusCode:
        typeof body?.statusCode === 'number'
          ? body.statusCode
          : error.status,

      message: Array.isArray(message)
        ? message.join(', ')
        : typeof message === 'string'
          ? message
          : error.message || 'Đã xảy ra lỗi khi gọi API.',

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
                error: toApiError(error),
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
                error: toApiError(error),
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
                error: toApiError(error),
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
          map((tag) =>
            TagActions.createTagSuccess({ tag }),
          ),

          catchError((error: unknown) =>
            of(
              TagActions.createTagFailure({
                error: toApiError(error),
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
          map((tag) =>
            TagActions.updateTagSuccess({ tag }),
          ),

          catchError((error: unknown) =>
            of(
              TagActions.updateTagFailure({
                error: toApiError(error),
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
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Dashboard stats
  loadTagDashboardStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.loadTagDashboardStats),

      switchMap(() =>
        this.tagService.getDashboardStats().pipe(
          map((stats) =>
            TagActions.loadTagDashboardStatsSuccess({
              stats,
            }),
          ),

          catchError((error: unknown) =>
            of(
              TagActions.loadTagDashboardStatsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
