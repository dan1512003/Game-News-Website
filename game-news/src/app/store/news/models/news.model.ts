
import type {
  NewsContentBlock,
  NewsContentBlockInput,
  UserRole,
} from '../../../shared/models/common/common';

export type {
  ContentBlockType,
  NewsContentBlock,
  NewsContentBlockInput,
} from '../../../shared/models/common/common';

export type NewsRole = Extract<
  UserRole,
  'super_admin' | 'admin' | 'editor' | 'author'
>;

export type NewsStatus =
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'returned'
  | 'scheduled'
  | 'published';

export interface NewsCategory {
  category_id: number | string;
  name: string;
  slug?: string;
}

export interface NewsUser {
  user_id: number | string;
  username: string;
  email?: string;
  created_at?: Date | string;
}

export interface NewsTag {
  tag_id: number | string;
  name: string;
  slug?: string;
}

export interface NewsTagRelation {
  news_id: number | string;
  tag_id: number | string;
  tag?: NewsTag | null;
}

export interface NewsData {
  news_id: number | string;
  title: string;
  slug: string;
  summary: string | null;

  category_id: number | string;
  author_id: number | string;
  reviewer_id: number | string | null;

  thumbnail: string | null;
  status: NewsStatus;
  views: number | string;

  published_at: Date | string | null;
  scheduled_at: Date | string | null;

  editor_note: string | null;
  requirement_note: string | null;
  review_score: number | null;

  category: NewsCategory | null;
  author: NewsUser | null;
  reviewer: NewsUser | null;

  news_tags: NewsTagRelation[];
  content_blocks: NewsContentBlock[];

  created_at?: Date | string;
  updated_at?: Date | string;
}

export type NewsFilter =
  | 'mine'
  | 'published'
  | 'submitted'
  | 'processing'
  | 'scheduled'
  | 'draft'
  | 'returned'
  | 'required';

export type NewsTabFilter = NewsFilter | 'all';

export interface NewsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: NewsStatus;
  categoryId?: number | string;
  filter?: NewsFilter;
}

export type NewsStatusCounts = Partial<
  Record<NewsStatus, number>
>;

export type NewsCategoryCounts = Record<string, number>;

export type NewsFilterCounts = Partial<
  Record<NewsTabFilter, number>
>;

export interface NewsCounts {
  all: number;
  byFilter: NewsFilterCounts;
  byStatus: NewsStatusCounts;
  byCategory: NewsCategoryCounts;
}

export interface NewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NewsListResponse {
  items: NewsData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: NewsCounts;
}

/**
 * DTO tạo bài viết.
 * Backend yêu cầu categoryId và tagIds là number.
 * contentBlocks phải có position.
 */
export interface CreateNewsDto {
  title: string;
  slug: string;
  summary?: string | null;
  categoryId: number;
  thumbnail?: string | null;
  status?: NewsStatus;
  tagIds?: number[];
  contentBlocks?: NewsContentBlockInput[];

  authorId?: number | string | null;
  reviewerId?: number | string | null;
  views?: number;
  publishedAt?: Date | string | null;
  scheduledAt?: Date | string | null;
  editorNote?: string | null;
  requirementNote?: string | null;
  reviewScore?: number | null;
}

/** DTO cập nhật bài viết. */
export interface UpdateNewsDto {
  title?: string;
  slug?: string;
  summary?: string | null;
  categoryId?: number;
  thumbnail?: string | null;
  status?: NewsStatus;
  tagIds?: number[];
  contentBlocks?: NewsContentBlockInput[];

  authorId?: number | string | null;
  reviewerId?: number | string | null;
  views?: number;
  publishedAt?: Date | string | null;
  scheduledAt?: Date | string | null;
  editorNote?: string | null;
  requirementNote?: string | null;
  reviewScore?: number | null;
}

export interface NewsNoteDto {
  note: string;
}

export interface ScheduleNewsDto {
  scheduledAt: string;
}

export interface NewsActionResponse {
  message?: string;
  [key: string]: unknown;
}

export interface NewsDashboardTopViewed {
  news_id: number | string;
  title: string;
  slug: string;
  thumbnail: string | null;
  views: number;
  published_at: Date | string | null;

  category: {
    category_id: number | string;
    name: string;
  } | null;

  author: {
    user_id: number | string;
    username: string;
  } | null;
}

export interface NewsDashboardStats {
  total: number;
  draft: number;
  submitted: number;
  processing: number;
  scheduled: number;
  published: number;
  returned: number;
  totalViews: number;
  topViewed: NewsDashboardTopViewed[];
}