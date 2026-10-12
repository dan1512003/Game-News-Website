
import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import { newsFeatureKey } from './news.reducer';
import { NewsState } from './news.state';
import {
  NewsFilter,
  NewsStatus,
} from './models/news.model';

export const selectNewsState =
  createFeatureSelector<NewsState>(newsFeatureKey);

export const selectNewsItems = createSelector(
  selectNewsState,
  (state) => state.items,
);

export const selectSelectedNews = createSelector(
  selectNewsState,
  (state) => state.selectedNews,
);

export const selectNewsPagination = createSelector(
  selectNewsState,
  (state) => state.pagination,
);

export const selectNewsQuery = createSelector(
  selectNewsState,
  (state) => state.query,
);

export const selectNewsCounts = createSelector(
  selectNewsState,
  (state) => state.counts,
);

export const selectNewsCountAll = createSelector(
  selectNewsCounts,
  (counts) => counts.all,
);

export const selectNewsCountsByFilter = createSelector(
  selectNewsCounts,
  (counts) => counts.byFilter,
);

export const selectNewsCountByFilter = (
  filter: NewsFilter | 'all',
) =>
  createSelector(
    selectNewsCountsByFilter,
    (counts) => counts[filter] ?? 0,
  );

export const selectNewsCountsByStatus = createSelector(
  selectNewsCounts,
  (counts) => counts.byStatus,
);

export const selectNewsCountsByCategory = createSelector(
  selectNewsCounts,
  (counts) => counts.byCategory,
);

export const selectNewsLoading = createSelector(
  selectNewsState,
  (state) => state.loading,
);

export const selectNewsDetailLoading = createSelector(
  selectNewsState,
  (state) => state.detailLoading,
);

export const selectNewsSaving = createSelector(
  selectNewsState,
  (state) => state.saving,
);

export const selectNewsDeleting = createSelector(
  selectNewsState,
  (state) => state.deleting,
);

export const selectNewsError = createSelector(
  selectNewsState,
  (state) => state.error,
);

export const selectNewsSuccessMessage = createSelector(
  selectNewsState,
  (state) => state.successMessage,
);

export const selectNewsTotal = createSelector(
  selectNewsPagination,
  (pagination) => pagination.total,
);

export const selectNewsTotalPages = createSelector(
  selectNewsPagination,
  (pagination) => pagination.totalPages,
);

export const selectNewsById = (id: string) =>
  createSelector(
    selectNewsItems,
    (items) =>
      items.find(
        (item) => String(item.news_id) === id,
      ) ?? null,
  );

export const selectNewsByStatus = (
  status: NewsStatus,
) =>
  createSelector(
    selectNewsItems,
    (items) =>
      items.filter((item) => item.status === status),
  );


  // =====================================================
// DASHBOARD SELECTORS
// =====================================================

export const selectNewsDashboardStats = createSelector(
  selectNewsState,
  (state) => state.dashboardStats,
);

export const selectNewsDashboardStatsLoading = createSelector(
  selectNewsState,
  (state) => state.dashboardStatsLoading,
);

export const selectNewsDashboardStatsError = createSelector(
  selectNewsState,
  (state) => state.dashboardStatsError,
);

export const selectNewsDashboardTotal = createSelector(
  selectNewsDashboardStats,
  (stats) => stats?.total ?? 0,
);

export const selectNewsDashboardTotalViews = createSelector(
  selectNewsDashboardStats,
  (stats) => stats?.totalViews ?? 0,
);

export const selectNewsDashboardTopViewed = createSelector(
  selectNewsDashboardStats,
  (stats) => stats?.topViewed ?? [],
);