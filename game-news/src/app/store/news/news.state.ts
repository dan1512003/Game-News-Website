
import {
  NewsCounts,
  NewsDashboardStats,
  NewsData,
  NewsPagination,
  NewsQuery,
} from './models/news.model';

export interface NewsState {
  items: NewsData[];
  selectedNews: NewsData | null;
  pagination: NewsPagination;
  counts: NewsCounts;
  query: NewsQuery;
  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  successMessage: string | null;
   // Dashboard
  dashboardStats: NewsDashboardStats | null;
  dashboardStatsLoading: boolean;
  dashboardStatsError: string | null;
}

export const initialNewsState: NewsState = {
  items: [],
  selectedNews: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  counts: {
    all: 0,
    byFilter: {
      all: 0,
      mine: 0,
      published: 0,
      submitted: 0,
      processing: 0,
      scheduled: 0,
      draft: 0,
      returned: 0,
      required: 0,
    },
    byStatus: {},
    byCategory: {},
  },

  query: {
    page: 1,
    limit: 10,
  },

  loading: false,
  detailLoading: false,
  saving: false,
  deleting: false,
  error: null,
  successMessage: null,

    dashboardStats: null,
  dashboardStatsLoading: false,
  dashboardStatsError: null,
};