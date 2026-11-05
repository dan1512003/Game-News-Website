
import { createAction, props } from '@ngrx/store';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

import {
  Category,
  CategoryDashboardStats,
  CategoryOption,
  CategoryListResponse,
  CategoryQuery,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './models/category.model';

// Dashboard stats
export const loadCategoryDashboardStats = createAction(
  '[Category] Load Dashboard Stats',
);

export const loadCategoryDashboardStatsSuccess = createAction(
  '[Category] Load Dashboard Stats Success',
  props<{ stats: CategoryDashboardStats }>(),
);

export const loadCategoryDashboardStatsFailure = createAction(
  '[Category] Load Dashboard Stats Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Danh sách
export const loadCategories = createAction(
  '[Category] Load Categories',
  props<{ query?: CategoryQuery }>(),
);

export const loadCategoriesSuccess = createAction(
  '[Category] Load Categories Success',
  props<{ result: CategoryListResponse }>(),
);

export const loadCategoriesFailure = createAction(
  '[Category] Load Categories Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Options
export const loadCategoryOptions = createAction(
  '[Category] Load Category Options',
);

export const loadCategoryOptionsSuccess = createAction(
  '[Category] Load Category Options Success',
  props<{ options: CategoryOption[] }>(),
);

export const loadCategoryOptionsFailure = createAction(
  '[Category] Load Category Options Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Chi tiết
export const loadCategory = createAction(
  '[Category] Load Category',
  props<{ id: string }>(),
);

export const loadCategorySuccess = createAction(
  '[Category] Load Category Success',
  props<{ category: Category }>(),
);

// Tạo
export const createCategory = createAction(
  '[Category] Create Category',
  props<{ dto: CreateCategoryDto }>(),
);

export const createCategorySuccess = createAction(
  '[Category] Create Category Success',
  props<{ message: string }>(),
);

// Cập nhật
export const updateCategory = createAction(
  '[Category] Update Category',
  props<{ id: string; dto: UpdateCategoryDto }>(),
);

export const updateCategorySuccess = createAction(
  '[Category] Update Category Success',
  props<{ message: string }>(),
);

// Xóa
export const deleteCategory = createAction(
  '[Category] Delete Category',
  props<{ id: string }>(),
);

export const deleteCategorySuccess = createAction(
  '[Category] Delete Category Success',
  props<{ id: string; message: string }>(),
);

// Lỗi và thông báo chung
export const categoryOperationFailure = createAction(
  '[Category] Operation Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Xóa thông báo
export const clearCategoryMessages = createAction(
  '[Category] Clear Messages',
);
