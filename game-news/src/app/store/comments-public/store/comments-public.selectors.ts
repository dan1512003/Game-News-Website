import { createFeatureSelector, createSelector } from '@ngrx/store';
import { commentsPublicFeatureKey } from './comments-public.reducer';
import { CommentsPublicState } from './comments-public.state';

export const selectCommentsPublicState =
  createFeatureSelector<CommentsPublicState>(commentsPublicFeatureKey);

export const selectPublicComments = createSelector(
  selectCommentsPublicState,
  (state) => state.comments,
);
export const selectPublicCommentsLoading = createSelector(
  selectCommentsPublicState,
  (state) => state.loading,
);
export const selectPublicCommentSubmitting = createSelector(
  selectCommentsPublicState,
  (state) => state.submitting,
);
export const selectLikingCommentId = createSelector(
  selectCommentsPublicState,
  (state) => state.likingCommentId,
);
export const selectCommentsPublicError = createSelector(
  selectCommentsPublicState,
  (state) => state.error,
);
export const selectCommentsPublicSuccessMessage = createSelector(
  selectCommentsPublicState,
  (state) => state.successMessage,
);
export const selectCommentsPublicNewsId = createSelector(
  selectCommentsPublicState,
  (state) => state.newsId,
);
