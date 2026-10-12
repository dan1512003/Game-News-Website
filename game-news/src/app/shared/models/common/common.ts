export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'editor'
  | 'author'
  | 'user';

export type ContentBlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'video'
  | 'quote'
  | 'list'
  | 'embed';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NewsContentBlock {
  block_id?: string;
  news_id?: string;
  type: ContentBlockType | string;
  content: string;
  position: number;
}

export interface NewsContentBlockInput {
  type: ContentBlockType | string;
  content: string;
  position: number;
}