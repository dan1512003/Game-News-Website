
import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

import {
  Category,
  CategoryMeta,
  CategoryOption,
  CategoryDashboardStats,
} from './models/category.model';

export interface CategoryState {
  categories: Category[];
  categoryOptions: CategoryOption[];
  selectedCategory: Category | null;
  meta: CategoryMeta;

  // Dashboard
  dashboardStats: CategoryDashboardStats | null;
  dashboardStatsLoading: boolean;
  dashboardStatsError: ApiErrorResponse | null;

  // Loading
  loading: boolean;
  optionsLoading: boolean;

  // Errors
  optionsError: ApiErrorResponse | null;
  error: ApiErrorResponse | null;

  // Operations
  submitting: boolean;
  deleting: boolean;

  // Messages
  successMessage: string | null;
}

export const initialCategoryState: CategoryState = {
  categories: [],
  categoryOptions: [],
  selectedCategory: null,

  meta: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  },

  // Dashboard
  dashboardStats: null,
  dashboardStatsLoading: false,
  dashboardStatsError: null,

  // Loading
  loading: false,
  optionsLoading: false,

  // Errors
  optionsError: null,
  error: null,

  // Operations
  submitting: false,
  deleting: false,

  // Messages
  successMessage: null,
};
