
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
  dashboardStatsError: string | null;

  loading: boolean;
  optionsLoading: boolean;
  optionsError: string | null;
  submitting: boolean;
  deleting: boolean;
  error: string | null;
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

  dashboardStats: null,
  dashboardStatsLoading: false,
  dashboardStatsError: null,

  loading: false,
  optionsLoading: false,
  optionsError: null,
  submitting: false,
  deleting: false,
  error: null,
  successMessage: null,
};