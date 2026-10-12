
import type { PaginationMeta } from '../../../shared/models/common/common';

export interface Tag {
  tag_id: string;
  name: string;
  description: string | null;
}

export interface TagOption {
  tag_id: string;
  name: string;
}

export interface CreateTagDto {
  name: string;
  description?: string | null;
}

export interface UpdateTagDto {
  name?: string;
  description?: string | null;
}

export interface TagQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface TagListResponse {
  items: Tag[];
  meta: TagMeta;
}

export type TagMeta = PaginationMeta;

export interface DeleteTagResponse {
  message: string;
  tag_id: string;
}

export interface TagDashboardStats {
  total: number;
}