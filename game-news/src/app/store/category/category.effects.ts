
import { Injectable, inject } from '@angular/core';

import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';

import {
  catchError,
  map,
  of,
  switchMap,
  exhaustMap,
} from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

import { CategoryService } from './services/category.service';

import {
  loadCategories,
  loadCategoriesSuccess,
  loadCategoriesFailure,
  loadCategoryOptions,
  loadCategoryOptionsSuccess,
  loadCategoryOptionsFailure,
  loadCategory,
  loadCategorySuccess,
  createCategory,
  createCategorySuccess,
  updateCategory,
  updateCategorySuccess,
  deleteCategory,
  deleteCategorySuccess,
  categoryOperationFailure,
  loadCategoryDashboardStats,
  loadCategoryDashboardStatsSuccess,
  loadCategoryDashboardStatsFailure,
} from './category.actions';

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
export class CategoryEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(CategoryService);

  // ===== Load categories =====
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategories),
      switchMap(({ query }) =>
        this.service.getAll(query).pipe(
          map((result) =>
            loadCategoriesSuccess({ result }),
          ),
          catchError((error: unknown) =>
            of(
              loadCategoriesFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Load category options =====
  loadCategoryOptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategoryOptions),
      switchMap(() =>
        this.service.getOptions().pipe(
          map((options) =>
            loadCategoryOptionsSuccess({ options }),
          ),
          catchError((error: unknown) =>
            of(
              loadCategoryOptionsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Load category detail =====
  loadCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategory),
      switchMap(({ id }) =>
        this.service.getById(id).pipe(
          map((category) =>
            loadCategorySuccess({ category }),
          ),
          catchError((error: unknown) =>
            of(
              categoryOperationFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Create =====
  createCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createCategory),
      exhaustMap(({ dto }) =>
        this.service.create(dto).pipe(
          map(() =>
            createCategorySuccess({
              message: 'Thêm danh mục thành công',
            }),
          ),
          catchError((error: unknown) =>
            of(
              categoryOperationFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Update =====
  updateCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCategory),
      exhaustMap(({ id, dto }) =>
        this.service.update(id, dto).pipe(
          map(() =>
            updateCategorySuccess({
              message: 'Cập nhật danh mục thành công',
            }),
          ),
          catchError((error: unknown) =>
            of(
              categoryOperationFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Dashboard stats =====
  loadCategoryDashboardStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategoryDashboardStats),
      switchMap(() =>
        this.service.getDashboardStats().pipe(
          map((stats) =>
            loadCategoryDashboardStatsSuccess({ stats }),
          ),
          catchError((error: unknown) =>
            of(
              loadCategoryDashboardStatsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // ===== Delete =====
  deleteCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteCategory),
      exhaustMap(({ id }) =>
        this.service.delete(id).pipe(
          map((result) =>
            deleteCategorySuccess({
              id,
              message:
                result.message ?? 'Xóa danh mục thành công',
            }),
          ),
          catchError((error: unknown) =>
            of(
              categoryOperationFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
