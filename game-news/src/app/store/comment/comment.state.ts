
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
  loading: boolean;
  loadingDetail: boolean;
  loadingParent: boolean;
  submitting: boolean;
  deleting: boolean;
  error: string | null;
  successMessage: string | null;
  dashboardStats: CommentDashboardStats | null;
dashboardStatsLoading: boolean;
dashboardStatsError: string | null;
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

