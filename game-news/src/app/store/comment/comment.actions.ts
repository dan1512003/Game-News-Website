import { createAction, props } from '@ngrx/store';

import {
  CommentDashboardStats,
  CommentDetail,
  CommentListResponse,
  CommentParentDetail,
  CommentQuery,
  CommentStatusResponse,
  DeleteCommentResponse,
} from './models/comment.model';

// Danh sách
export const loadComments = createAction(
  '[Comments] Load Comments',
  props<{ query: CommentQuery }>(),
);

export const loadCommentsSuccess = createAction(
  '[Comments] Load Comments Success',
  props<{ response: CommentListResponse }>(),
);

export const loadCommentsFailure = createAction(
  '[Comments] Load Comments Failure',
  props<{ error: string }>(),
);

// Chi tiết
export const loadCommentById = createAction(
  '[Comments] Load Comment By Id',
  props<{ id: string }>(),
);

export const loadCommentByIdSuccess = createAction(
  '[Comments] Load Comment By Id Success',
  props<{ comment: CommentDetail }>(),
);

export const loadCommentByIdFailure = createAction(
  '[Comments] Load Comment By Id Failure',
  props<{ error: string }>(),
);

// Bình luận cha
export const loadCommentParent = createAction(
  '[Comments] Load Comment Parent',
  props<{ id: string }>(),
);

export const loadCommentParentSuccess = createAction(
  '[Comments] Load Comment Parent Success',
  props<{ parent: CommentParentDetail | null }>(),
);

export const loadCommentParentFailure = createAction(
  '[Comments] Load Comment Parent Failure',
  props<{ error: string }>(),
);

// Duyệt
export const approveComment = createAction(
  '[Comments] Approve Comment',
  props<{ id: string }>(),
);

export const approveCommentSuccess = createAction(
  '[Comments] Approve Comment Success',
  props<{ response: CommentStatusResponse }>(),
);

export const approveCommentFailure = createAction(
  '[Comments] Approve Comment Failure',
  props<{ error: string }>(),
);

// Từ chối
export const rejectComment = createAction(
  '[Comments] Reject Comment',
  props<{ id: string }>(),
);

export const rejectCommentSuccess = createAction(
  '[Comments] Reject Comment Success',
  props<{ response: CommentStatusResponse }>(),
);

export const rejectCommentFailure = createAction(
  '[Comments] Reject Comment Failure',
  props<{ error: string }>(),
);

// Xóa
export const deleteComment = createAction(
  '[Comments] Delete Comment',
  props<{ id: string }>(),
);

export const deleteCommentSuccess = createAction(
  '[Comments] Delete Comment Success',
  props<{ response: DeleteCommentResponse }>(),
);

export const deleteCommentFailure = createAction(
  '[Comments] Delete Comment Failure',
  props<{ error: string }>(),
);

// Xóa thông báo
export const clearCommentMessages = createAction(
  '[Comments] Clear Messages',
);
export const loadCommentDashboardStats = createAction(
  '[Comments] Load Dashboard Stats',
);

export const loadCommentDashboardStatsSuccess = createAction(
  '[Comments] Load Dashboard Stats Success',
  props<{ stats: CommentDashboardStats }>(),
);

export const loadCommentDashboardStatsFailure = createAction(
  '[Comments] Load Dashboard Stats Failure',
  props<{ error: string }>(),
);