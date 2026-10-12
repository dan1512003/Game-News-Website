
import { createReducer, on } from '@ngrx/store';

import { initialCategoryState } from './category.state';

import {
  loadCategories,
  loadCategoriesSuccess,
  loadCategoriesFailure,

  loadCategoryOptions,
  loadCategoryOptionsSuccess,
  loadCategoryOptionsFailure,

  loadCategory,
  loadCategorySuccess,

  createCategory,
  createCategorySuccess,

  updateCategory,
  updateCategorySuccess,

  deleteCategory,
  deleteCategorySuccess,

  categoryOperationFailure,
  clearCategoryMessages,
  loadCategoryDashboardStats,
  loadCategoryDashboardStatsSuccess,
  loadCategoryDashboardStatsFailure,
} from './category.actions';

export const categoryReducer = createReducer(
  initialCategoryState,

  // ===== Categories list =====
  on(loadCategories, (state) => ({
    ...state,
    loading: true,
    error: null,
    successMessage: null,
  })),

  on(loadCategoriesSuccess, (state, { result }) => ({
    ...state,
    categories: result.items,
    meta: result.meta,
    loading: false,
  })),

  on(loadCategoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ===== Category options =====
  on(loadCategoryOptions, (state) => ({
    ...state,
    optionsLoading: true,
    optionsError: null,
  })),

  on(loadCategoryOptionsSuccess, (state, { options }) => ({
    ...state,
    categoryOptions: options,
    optionsLoading: false,
    optionsError: null,
  })),

  on(loadCategoryOptionsFailure, (state, { error }) => ({
    ...state,
    optionsLoading: false,
    optionsError: error,
  })),

  // ===== Category detail =====
  on(loadCategory, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loadCategorySuccess, (state, { category }) => ({
    ...state,
    selectedCategory: category,
    loading: false,
  })),

  // ===== Create =====
  on(createCategory, (state) => ({
    ...state,
    submitting: true,
    error: null,
    successMessage: null,
  })),

  on(createCategorySuccess, (state, { message }) => ({
    ...state,
    submitting: false,
    successMessage: message,
  })),

  // ===== Update =====
  on(updateCategory, (state) => ({
    ...state,
    submitting: true,
    error: null,
    successMessage: null,
  })),

  on(updateCategorySuccess, (state, { message }) => ({
    ...state,
    submitting: false,
    successMessage: message,
  })),

  // ===== Delete =====
  on(deleteCategory, (state) => ({
    ...state,
    deleting: true,
    error: null,
    successMessage: null,
  })),

  on(deleteCategorySuccess, (state, { id, message }) => ({
    ...state,

    categories: state.categories.filter(
      (category) => category.category_id !== id,
    ),

    categoryOptions: state.categoryOptions.filter(
      (category) => category.category_id !== id,
    ),

    meta: {
      ...state.meta,
      total: Math.max(0, state.meta.total - 1),
      totalPages: Math.ceil(
        Math.max(0, state.meta.total - 1) /
          state.meta.limit,
      ),
    },

    deleting: false,
    successMessage: message,

    selectedCategory:
      state.selectedCategory?.category_id === id
        ? null
        : state.selectedCategory,
  })),

  // ===== Operation failure =====
  on(categoryOperationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    submitting: false,
    deleting: false,
    error,
  })),

  // ===== Clear messages =====
  on(clearCategoryMessages, (state) => ({
    ...state,
    error: null,
    successMessage: null,
  })),
  
on(loadCategoryDashboardStats, (state) => ({
  ...state,
  dashboardStatsLoading: true,
  dashboardStatsError: null,
})),

on(
  loadCategoryDashboardStatsSuccess,
  (state, { stats }) => ({
    ...state,
    dashboardStats: stats,
    dashboardStatsLoading: false,
    dashboardStatsError: null,
  }),
),

on(
  loadCategoryDashboardStatsFailure,
  (state, { error }) => ({
    ...state,
    dashboardStatsLoading: false,
    dashboardStatsError: error,
  }),
),
);