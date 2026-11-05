import {
  Tag,
  TagMeta,
  TagOption,
  TagDashboardStats,
} from './models/tag.model';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

export interface TagState {
  tags: Tag[];
  selectedTag: Tag | null;
  meta: TagMeta;

  // Options
  options: TagOption[];
  optionsLoading: boolean;
  optionsError: ApiErrorResponse | null;

  // Dashboard
  dashboardStats: TagDashboardStats | null;
  dashboardStatsLoading: boolean;
  dashboardStatsError: ApiErrorResponse | null;

  loading: boolean;
  submitting: boolean;
  deleting: boolean;

  error: ApiErrorResponse | null;
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