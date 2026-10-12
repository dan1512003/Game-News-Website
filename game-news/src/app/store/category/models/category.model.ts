
import type { PaginationMeta } from '../../../shared/models/common/common';

export interface Category {
  category_id: string;
  name: string;
  description: string | null;
  news_count?: number;
}

export interface CategoryOption {
  category_id: string;
  name: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CategoryListResponse {
  items: Category[];
  meta: CategoryMeta;
}

export type CategoryMeta = PaginationMeta;

export interface DeleteCategoryResponse {
  message: string;
  category_id: string;
}

export interface CategoryDashboardStats {
  total: number;
}