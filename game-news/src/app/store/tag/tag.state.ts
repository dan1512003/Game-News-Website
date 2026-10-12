
import {
  Tag,
  TagMeta,
  TagOption,
  TagDashboardStats,
} from './models/tag.model';

export interface TagState {
  tags: Tag[];
  selectedTag: Tag | null;
  meta: TagMeta;

  // Options cho select
  options: TagOption[];
  optionsLoading: boolean;
  optionsError: string | null;

  // Dashboard
  dashboardStats: TagDashboardStats | null;
  dashboardStatsLoading: boolean;
  dashboardStatsError: string | null;

  loading: boolean;
  submitting: boolean;
  deleting: boolean;
  error: string | null;
  successMessage: string | null;
}

export const initialTagState: TagState = {
  tags: [],
  selectedTag: null,

  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  options: [],
  optionsLoading: false,
  optionsError: null,

  dashboardStats: null,
  dashboardStatsLoading: false,
  dashboardStatsError: null,

  loading: false,
  submitting: false,
  deleting: false,
  error: null,
  successMessage: null,
};