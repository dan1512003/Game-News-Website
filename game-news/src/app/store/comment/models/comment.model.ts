
export type CommentStatus =
  | 'pending'
  | 'approved'
  | 'spam';

export interface CommentUser {
  username: string;
  email: string;
}

export interface CommentNews {
  title: string;
  slug: string;
  thumbnail: string | null;
  status: string;
  published_at: Date | string | null;
  views: number;
  category_id: string;
  author: string | null;
}

export interface CommentParent {
  comment_id: string;
  user_id: string;
  username: string | null;
  content: string;
}

export interface CommentParentDetail extends CommentParent {
  status: CommentStatus;
  created_at: Date | string;
}

export interface CommentData {
  comment_id: string;
  news_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  status: CommentStatus;
  likes: number;
  created_at: Date | string;
  user: CommentUser | null;
  news: CommentNews | null;
  parent: CommentParent | null;
}

export interface CommentDetail extends CommentData {}

export interface CommentQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CommentStatus;
  newsId?: string;
  userId?: string;
}

export interface CommentStatusCounts {
  pending: number;
  approved: number;
  spam: number;
}

export interface CommentCounts {
  all: number;
  byStatus: CommentStatusCounts;
}

export interface CommentListResponse {
  items: CommentData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: CommentCounts;
}

export interface CommentMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentStatusResponse {
  comment_id: string;
  status: CommentStatus;
  message: string;
}

export interface DeleteCommentResponse {
  message: string;
  comment_id: string;
}


export interface CommentDashboardStats {
  total: number;
  pending: number;
  approved: number;
  spam: number;
}