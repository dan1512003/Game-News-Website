
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
          map((result) => loadCategoriesSuccess({ result })),
          catchError((error) =>
            of(
              loadCategoriesFailure({
                error: this.getErrorMessage(error),
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
          catchError((error) =>
            of(
              loadCategoryOptionsFailure({
                error: this.getErrorMessage(error),
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
          map((category) => loadCategorySuccess({ category })),
          catchError((error) =>
            of(
              categoryOperationFailure({
                error: this.getErrorMessage(error),
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
          catchError((error) =>
            of(
              categoryOperationFailure({
                error: this.getErrorMessage(error),
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
          catchError((error) =>
            of(
              categoryOperationFailure({
                error: this.getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

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
              error: this.getErrorMessage(error),
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
          catchError((error) =>
            of(
              categoryOperationFailure({
                error: this.getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  private getErrorMessage(error: any): string {
    const body = error?.error;

    if (Array.isArray(body?.message)) {
      return body.message.join(', ');
    }

    if (typeof body?.message === 'string') {
      return body.message;
    }

    if (error?.status === 401) {
      return 'Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập';
    }

    if (error?.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này';
    }

    return 'Đã xảy ra lỗi. Vui lòng thử lại';
  }
  
}