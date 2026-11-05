
import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

import {
  CommentData,
  CommentDetail,
  CommentMeta,
  CommentParentDetail,
  CommentCounts,
  CommentDashboardStats,
} from './models/comment.model';

export interface CommentState {
  comments: CommentData[];
  selectedComment: CommentDetail | null;
  selectedParent: CommentParentDetail | null;
  meta: CommentMeta;
  counts: CommentCounts;

  // Loading
  loading: boolean;
  loadingDetail: boolean;
  loadingParent: boolean;

  // Operations
  submitting: boolean;
  deleting: boolean;

  // Errors and messages
  error: ApiErrorResponse | null;
  successMessage: string | null;

  // Dashboard
  dashboardStats: CommentDashboardStats | null;
  dashboardStatsLoading: boolean;
  dashboardStatsError: ApiErrorResponse | null;
}

export const initialCommentState: CommentState = {
  comments: [],
  selectedComment: null,
  selectedParent: null,

  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  counts: {
    all: 0,
    byStatus: {
      pending: 0,
      approved: 0,
      spam: 0,
    },
  },

  loading: false,
  loadingDetail: false,
  loadingParent: false,

  submitting: false,
  deleting: false,

  error: null,
  successMessage: null,

  dashboardStats: null,
  dashboardStatsLoading: false,
  dashboardStatsError: null,
};
