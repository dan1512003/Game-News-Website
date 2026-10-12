import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import { CommentState } from './comment.state';

export const COMMENT_FEATURE_KEY = 'comment';

export const selectCommentState =
  createFeatureSelector<CommentState>(
    COMMENT_FEATURE_KEY,
  );

// Danh sách
export const selectAllComments = createSelector(
  selectCommentState,
  (state) => state.comments,
);

// Chi tiết
export const selectSelectedComment = createSelector(
  selectCommentState,
  (state) => state.selectedComment,
);

// Bình luận cha
export const selectSelectedCommentParent = createSelector(
  selectCommentState,
  (state) => state.selectedParent,
);

// Phân trang
export const selectCommentMeta = createSelector(
  selectCommentState,
  (state) => state.meta,
);

export const selectCommentPage = createSelector(
  selectCommentMeta,
  (meta) => meta.page,
);

export const selectCommentLimit = createSelector(
  selectCommentMeta,
  (meta) => meta.limit,
);

export const selectCommentTotal = createSelector(
  selectCommentMeta,
  (meta) => meta.total,
);

export const selectCommentTotalPages = createSelector(
  selectCommentMeta,
  (meta) => meta.totalPages,
);

// Trạng thái xử lý
export const selectCommentLoading = createSelector(
  selectCommentState,
  (state) => state.loading,
);

export const selectCommentLoadingDetail = createSelector(
  selectCommentState,
  (state) => state.loadingDetail,
);

export const selectCommentLoadingParent = createSelector(
  selectCommentState,
  (state) => state.loadingParent,
);

export const selectCommentSubmitting = createSelector(
  selectCommentState,
  (state) => state.submitting,
);

export const selectCommentDeleting = createSelector(
  selectCommentState,
  (state) => state.deleting,
);

// Thông báo
export const selectCommentError = createSelector(
  selectCommentState,
  (state) => state.error,
);

export const selectCommentSuccessMessage = createSelector(
  selectCommentState,
  (state) => state.successMessage,
);

// Tiện ích
export const selectHasComments = createSelector(
  selectAllComments,
  (comments) => comments.length > 0,
);
export const selectCommentCounts = createSelector(
  selectCommentState,
  (state) => state.counts,
);

export const selectCommentCountAll = createSelector(
  selectCommentCounts,
  (counts) => counts.all,
);

export const selectCommentCountByStatus = createSelector(
  selectCommentCounts,
  (counts) => counts.byStatus,
);

export const selectCommentCountPending = createSelector(
  selectCommentCountByStatus,
  (counts) => counts.pending,
);

export const selectCommentCountApproved = createSelector(
  selectCommentCountByStatus,
  (counts) => counts.approved,
);

export const selectCommentCountSpam = createSelector(
  selectCommentCountByStatus,
  (counts) => counts.spam,
);

// ============================================================
// DASHBOARD STATS
// ============================================================

export const selectCommentDashboardStats = createSelector(
  selectCommentState,
  (state) => state.dashboardStats,
);

export const selectCommentDashboardStatsLoading = createSelector(
  selectCommentState,
  (state) => state.dashboardStatsLoading,
);

export const selectCommentDashboardStatsError = createSelector(
  selectCommentState,
  (state) => state.dashboardStatsError,
);