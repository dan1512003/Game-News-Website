// users.model.ts

import type {
  PaginationMeta,
  UserRole,
} from '../../../shared/models/common/common';

export type { UserRole } from '../../../shared/models/common/common';

export type UserStatus =
  | 'pending_verification'
  | 'active'
  | 'banned';

export interface User {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date | string;
  updated_at?: Date | string;
}

export interface UserCommentStatus {
  status: string;
}

export interface UserNewsStatus {
  status: string;
}

export interface UserDetail extends User {
  comments: UserCommentStatus[];
  comment_total: number;
  authored_news: UserNewsStatus[];
  news_total: number;
  reviewed_news: UserNewsStatus[];
  reviewed_news_total: number;
}

export interface UpdateUserDto {
  role?: UserRole;
  status?: UserStatus;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserCounts {
  all: number;
  byStatus: Record<UserStatus, number>;
  byRole: Record<string, number>;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: UserCounts;
}

// Thống kê dashboard
export interface UserDashboardStats {
  total: number;
  admin: number;
  superAdmin: number;
  editor: number;
  author: number;
  user: number;
  banned: number;
}

export type UserMeta = PaginationMeta;

export interface DeleteUserResponse {
  message: string;
  user_id: string | number;
}