
import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import { TagState } from './tag.state';

export const TAG_FEATURE_KEY = 'tag';

export const selectTagState =
  createFeatureSelector<TagState>(TAG_FEATURE_KEY);

// Danh sách phân trang
export const selectAllTags = createSelector(
  selectTagState,
  (state) => state.tags,
);

// Toàn bộ tag options
export const selectTagOptions = createSelector(
  selectTagState,
  (state) => state.options,
);

export const selectTagOptionsLoading = createSelector(
  selectTagState,
  (state) => state.optionsLoading,
);

export const selectTagOptionsError = createSelector(
  selectTagState,
  (state) => state.optionsError,
);

// Chi tiết
export const selectSelectedTag = createSelector(
  selectTagState,
  (state) => state.selectedTag,
);

// Phân trang
export const selectTagMeta = createSelector(
  selectTagState,
  (state) => state.meta,
);

export const selectTagPage = createSelector(
  selectTagMeta,
  (meta) => meta.page,
);

export const selectTagLimit = createSelector(
  selectTagMeta,
  (meta) => meta.limit,
);

export const selectTagTotal = createSelector(
  selectTagMeta,
  (meta) => meta.total,
);

export const selectTagTotalPages = createSelector(
  selectTagMeta,
  (meta) => meta.totalPages,
);

// Loading CRUD
export const selectTagLoading = createSelector(
  selectTagState,
  (state) => state.loading,
);

export const selectTagSubmitting = createSelector(
  selectTagState,
  (state) => state.submitting,
);

export const selectTagDeleting = createSelector(
  selectTagState,
  (state) => state.deleting,
);

// Thông báo
export const selectTagError = createSelector(
  selectTagState,
  (state) => state.error,
);

export const selectTagSuccessMessage = createSelector(
  selectTagState,
  (state) => state.successMessage,
);

// Tiện ích
export const selectHasTags = createSelector(
  selectAllTags,
  (tags) => tags.length > 0,
);

export const selectHasTagOptions = createSelector(
  selectTagOptions,
  (options) => options.length > 0,
);

export const selectTagDashboardStats = createSelector(
  selectTagState,
  (state) => state.dashboardStats,
);

export const selectTagDashboardStatsLoading = createSelector(
  selectTagState,
  (state) => state.dashboardStatsLoading,
);

export const selectTagDashboardStatsError = createSelector(
  selectTagState,
  (state) => state.dashboardStatsError,
);

export const selectTagDashboardTotal = createSelector(
  selectTagDashboardStats,
  (stats) => stats?.total ?? 0,
);