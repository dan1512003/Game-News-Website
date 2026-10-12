
import { createReducer, on } from '@ngrx/store';

import {
  NewsCounts,
  NewsData,
} from './models/news.model';

import * as NewsActions from './news.actions';
import { initialNewsState } from './news.state';

export const newsFeatureKey = 'news';

// ============================================================
// UPSERT NEWS
// ============================================================

function upsertNews(
  items: NewsData[],
  news: NewsData,
): NewsData[] {
  const index = items.findIndex(
    (item) => item.news_id === news.news_id,
  );

  if (index === -1) {
    return [news, ...items];
  }

  return items.map((item) =>
    item.news_id === news.news_id
      ? {
          ...item,
          ...news,

          category: news.category ?? item.category,
          author: news.author ?? item.author,
          reviewer: news.reviewer ?? item.reviewer,

          news_tags:
            news.news_tags.length > 0
              ? news.news_tags
              : item.news_tags,

          content_blocks:
            news.content_blocks.length > 0
              ? news.content_blocks
              : item.content_blocks,
        }
      : item,
  );
}

// ============================================================
// NORMALIZE NEWS COUNTS
// ============================================================

function normalizeNewsCounts(
  counts: NewsCounts | null | undefined,
): NewsCounts {
  return {
    all: counts?.all ?? 0,

    byFilter: {
      ...initialNewsState.counts.byFilter,
      ...(counts?.byFilter ?? {}),
    },

    byStatus: counts?.byStatus ?? {},

    byCategory: counts?.byCategory ?? {},
  };
}

// ============================================================
// NEWS REDUCER
// ============================================================

export const newsReducer = createReducer(
  initialNewsState,

  // ==========================================================
  // DASHBOARD STATS
  // ==========================================================

  on(
    NewsActions.loadNewsDashboardStats,
    (state) => ({
      ...state,
      dashboardStatsLoading: true,
      dashboardStatsError: null,
    }),
  ),

  on(
    NewsActions.loadNewsDashboardStatsSuccess,
    (state, { stats }) => ({
      ...state,
      dashboardStats: stats,
      dashboardStatsLoading: false,
      dashboardStatsError: null,
    }),
  ),

  on(
    NewsActions.loadNewsDashboardStatsFailure,
    (state, { error }) => ({
      ...state,
      dashboardStatsLoading: false,
      dashboardStatsError: error,
    }),
  ),

  // ==========================================================
  // LOAD LIST
  // ==========================================================

  on(
    NewsActions.loadNews,
    (state, { query }) => ({
      ...state,
      loading: true,
      error: null,
      query: {
        ...state.query,
        ...query,
      },
    }),
  ),

  on(
    NewsActions.loadNewsSuccess,
    (state, { response }) => ({
      ...state,
      items: response.items,

      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      },

      counts: normalizeNewsCounts(response.counts),

      loading: false,
      error: null,
    }),
  ),

  on(
    NewsActions.loadNewsFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    }),
  ),

  // ==========================================================
  // LOAD DETAIL
  // ==========================================================

  on(
    NewsActions.loadNewsById,
    (state) => ({
      ...state,
      detailLoading: true,
      error: null,
    }),
  ),

  on(
    NewsActions.loadNewsByIdSuccess,
    (state, { news }) => ({
      ...state,
      selectedNews: news,
      items: upsertNews(state.items, news),
      detailLoading: false,
      error: null,
    }),
  ),

  on(
    NewsActions.loadNewsByIdFailure,
    (state, { error }) => ({
      ...state,
      detailLoading: false,
      error,
    }),
  ),

  on(
    NewsActions.clearSelectedNews,
    (state) => ({
      ...state,
      selectedNews: null,
      detailLoading: false,
    }),
  ),

  // ==========================================================
  // CREATE
  // ==========================================================

  on(
    NewsActions.createNews,
    (state) => ({
      ...state,
      saving: true,
      error: null,
      successMessage: null,
    }),
  ),

  on(
    NewsActions.createNewsSuccess,
    (state, { news }) => ({
      ...state,
      items: upsertNews(state.items, news),
      selectedNews: news,
      saving: false,
      error: null,
      successMessage: 'Tạo bài viết thành công',
    }),
  ),

  on(
    NewsActions.createNewsFailure,
    (state, { error }) => ({
      ...state,
      saving: false,
      error,
    }),
  ),

  // ==========================================================
  // UPDATE
  // ==========================================================

  on(
    NewsActions.updateNews,
    (state) => ({
      ...state,
      saving: true,
      error: null,
      successMessage: null,
    }),
  ),

  on(
    NewsActions.updateNewsSuccess,
    (state, { news }) => ({
      ...state,

      items: upsertNews(state.items, news),

      selectedNews:
        state.selectedNews?.news_id === news.news_id
          ? {
              ...state.selectedNews,
              ...news,

              category:
                news.category ??
                state.selectedNews.category,

              author:
                news.author ??
                state.selectedNews.author,

              reviewer:
                news.reviewer ??
                state.selectedNews.reviewer,

              news_tags:
                news.news_tags.length > 0
                  ? news.news_tags
                  : state.selectedNews.news_tags,

              content_blocks:
                news.content_blocks.length > 0
                  ? news.content_blocks
                  : state.selectedNews.content_blocks,
            }
          : state.selectedNews,

      saving: false,
      error: null,
      successMessage: 'Cập nhật bài viết thành công',
    }),
  ),

  on(
    NewsActions.updateNewsFailure,
    (state, { error }) => ({
      ...state,
      saving: false,
      error,
    }),
  ),

  // ==========================================================
  // DELETE
  // ==========================================================

  on(
    NewsActions.deleteNews,
    (state) => ({
      ...state,
      deleting: true,
      error: null,
      successMessage: null,
    }),
  ),

  on(
    NewsActions.deleteNewsSuccess,
    (state, { id, response }) => ({
      ...state,

      items: state.items.filter(
        (item) => item.news_id !== id,
      ),

      selectedNews:
        state.selectedNews?.news_id === id
          ? null
          : state.selectedNews,

      pagination: {
        ...state.pagination,
        total: Math.max(
          0,
          state.pagination.total - 1,
        ),
      },

      counts: {
        ...state.counts,
        all: Math.max(0, state.counts.all - 1),
      },

      deleting: false,
      error: null,
      successMessage:
        response.message ?? 'Đã xóa bài viết',
    }),
  ),

  on(
    NewsActions.deleteNewsFailure,
    (state, { error }) => ({
      ...state,
      deleting: false,
      error,
    }),
  ),

  // ==========================================================
  // WORKFLOW SUCCESS
  // ==========================================================


  on(
    NewsActions.newsWorkflowSuccess,
    (state, { news, message }) => ({
      ...state,
      items: upsertNews(state.items, news),
      selectedNews:
        state.selectedNews?.news_id === news.news_id
          ? news
          : state.selectedNews,
      saving: false,
      error: null,
      successMessage: message,
    }),
  ),

  on(
    NewsActions.newsWorkflowFailure,
    (state, { error }) => ({
      ...state,
      saving: false,
      error,
    }),
  ),


  // ==========================================================
  // CLEAR ERROR
  // ==========================================================

  on(
    NewsActions.clearNewsError,
    (state) => ({
      ...state,
      error: null,
      successMessage: null,
    }),
  ),
);

