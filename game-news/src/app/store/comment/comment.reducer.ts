import { createReducer, on } from '@ngrx/store';

import { initialCommentState } from './comment.state';
import * as CommentActions from './comment.actions';

export const commentReducer = createReducer(
  initialCommentState,

  // Danh sách
  on(CommentActions.loadComments, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

 on(
  CommentActions.loadCommentsSuccess,
  (state, { response }) => ({
    ...state,
    comments: response.items,
    meta: {
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    },
    counts: response.counts,
    loading: false,
    error: null,
  }),
),
  on(
    CommentActions.loadCommentsFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    }),
  ),

  // Chi tiết
  on(CommentActions.loadCommentById, (state) => ({
    ...state,
    loadingDetail: true,
    error: null,
  })),

  on(
    CommentActions.loadCommentByIdSuccess,
    (state, { comment }) => ({
      ...state,
      selectedComment: comment,
      loadingDetail: false,
      error: null,
    }),
  ),

  on(
    CommentActions.loadCommentByIdFailure,
    (state, { error }) => ({
      ...state,
      loadingDetail: false,
      error,
    }),
  ),

  // Bình luận cha
  on(CommentActions.loadCommentParent, (state) => ({
    ...state,
    loadingParent: true,
    error: null,
  })),

  on(
    CommentActions.loadCommentParentSuccess,
    (state, { parent }) => ({
      ...state,
      selectedParent: parent,
      loadingParent: false,
      error: null,
    }),
  ),

  on(
    CommentActions.loadCommentParentFailure,
    (state, { error }) => ({
      ...state,
      loadingParent: false,
      error,
    }),
  ),

  // Bắt đầu duyệt
  on(CommentActions.approveComment, (state) => ({
    ...state,
    submitting: true,
    error: null,
    successMessage: null,
  })),

  // Bắt đầu từ chối
  on(CommentActions.rejectComment, (state) => ({
    ...state,
    submitting: true,
    error: null,
    successMessage: null,
  })),

  // Duyệt thành công
  on(
    CommentActions.approveCommentSuccess,
    (state, { response }) => ({
      ...state,

      comments: state.comments.map((item) =>
        item.comment_id === response.comment_id
          ? { ...item, status: response.status }
          : item,
      ),

      selectedComment:
        state.selectedComment?.comment_id === response.comment_id
          ? { ...state.selectedComment, status: response.status }
          : state.selectedComment,

      submitting: false,
      error: null,
      successMessage: response.message,
    }),
  ),

  // Từ chối thành công
  on(
    CommentActions.rejectCommentSuccess,
    (state, { response }) => ({
      ...state,

      comments: state.comments.map((item) =>
        item.comment_id === response.comment_id
          ? { ...item, status: response.status }
          : item,
      ),

      selectedComment:
        state.selectedComment?.comment_id === response.comment_id
          ? { ...state.selectedComment, status: response.status }
          : state.selectedComment,

      submitting: false,
      error: null,
      successMessage: response.message,
    }),
  ),

  // Duyệt hoặc từ chối thất bại
  on(
    CommentActions.approveCommentFailure,
    CommentActions.rejectCommentFailure,
    (state, { error }) => ({
      ...state,
      submitting: false,
      error,
    }),
  ),

  // Bắt đầu xóa
  on(CommentActions.deleteComment, (state) => ({
    ...state,
    deleting: true,
    error: null,
    successMessage: null,
  })),

  // Xóa thành công
  on(
    CommentActions.deleteCommentSuccess,
    (state, { response }) => {
      const comments = state.comments.filter(
        (item) => item.comment_id !== response.comment_id,
      );

      const total = Math.max(0, state.meta.total - 1);

      return {
        ...state,
        comments,
        selectedComment:
          state.selectedComment?.comment_id === response.comment_id
            ? null
            : state.selectedComment,
        selectedParent:
          state.selectedParent?.comment_id === response.comment_id
            ? null
            : state.selectedParent,
        meta: {
          ...state.meta,
          total,
          totalPages:
            state.meta.limit > 0
              ? Math.ceil(total / state.meta.limit)
              : 0,
        },
        deleting: false,
        error: null,
        successMessage: response.message,
      };
    },
  ),

  on(
    CommentActions.deleteCommentFailure,
    (state, { error }) => ({
      ...state,
      deleting: false,
      error,
    }),
  ),

  // Thông báo
  on(CommentActions.clearCommentMessages, (state) => ({
    ...state,
    error: null,
    successMessage: null,
  })),


  // ============================================================
// DASHBOARD STATS
// ============================================================

on(
  CommentActions.loadCommentDashboardStats,
  (state) => ({
    ...state,
    dashboardStatsLoading: true,
    dashboardStatsError: null,
  }),
),

on(
  CommentActions.loadCommentDashboardStatsSuccess,
  (state, { stats }) => ({
    ...state,
    dashboardStats: stats,
    dashboardStatsLoading: false,
    dashboardStatsError: null,
  }),
),

on(
  CommentActions.loadCommentDashboardStatsFailure,
  (state, { error }) => ({
    ...state,
    dashboardStatsLoading: false,
    dashboardStatsError: error,
  }),
),
);