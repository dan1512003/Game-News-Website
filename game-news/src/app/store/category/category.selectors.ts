
import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import { CategoryState } from './category.state';

export const selectCategoryState =
  createFeatureSelector<CategoryState>('category');

export const selectCategories = createSelector(
  selectCategoryState,
  (state) => state.categories,
);

export const selectCategoryOptions = createSelector(
  selectCategoryState,
  (state) => state.categoryOptions,
);

export const selectCategoryOptionsLoading = createSelector(
  selectCategoryState,
  (state) => state.optionsLoading,
);

export const selectCategoryOptionsError = createSelector(
  selectCategoryState,
  (state) => state.optionsError,
);

export const selectSelectedCategory = createSelector(
  selectCategoryState,
  (state) => state.selectedCategory,
);

export const selectCategoryMeta = createSelector(
  selectCategoryState,
  (state) => state.meta,
);

export const selectCategoryLoading = createSelector(
  selectCategoryState,
  (state) => state.loading,
);

export const selectCategorySubmitting = createSelector(
  selectCategoryState,
  (state) => state.submitting,
);

export const selectCategoryDeleting = createSelector(
  selectCategoryState,
  (state) => state.deleting,
);

export const selectCategoryError = createSelector(
  selectCategoryState,
  (state) => state.error,
);

export const selectCategorySuccessMessage = createSelector(
  selectCategoryState,
  (state) => state.successMessage,
);

export const selectCategoryDashboardStats = createSelector(
  selectCategoryState,
  (state) => state.dashboardStats,
);

export const selectCategoryDashboardStatsLoading = createSelector(
  selectCategoryState,
  (state) => state.dashboardStatsLoading,
);

export const selectCategoryDashboardStatsError = createSelector(
  selectCategoryState,
  (state) => state.dashboardStatsError,
);

export const selectCategoryDashboardTotal = createSelector(
  selectCategoryDashboardStats,
  (stats) => stats?.total ?? 0,
);