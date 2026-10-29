import { createReducer, on } from '@ngrx/store';
import * as Actions from './comments-public.actions';
import { CommentsPublicState, initialCommentsPublicState } from './comments-public.state';

export const commentsPublicFeatureKey = 'commentsPublic';

export const commentsPublicReducer = createReducer(
  initialCommentsPublicState,

  on(Actions.loadComments, (state, { newsId }) => ({
    ...state,
    newsId,
    loading: true,
    error: null,
  })),
  on(Actions.loadCommentsSuccess, (state, { newsId, comments }) => ({
    ...state,
    newsId,
    comments,
    loading: false,
  })),
  on(Actions.loadCommentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(Actions.createComment, (state) => ({
    ...state,
    submitting: true,
    error: null,
    successMessage: null,
  })),
  on(Actions.createCommentSuccess, (state, { newsId, response }) => ({
    ...state,
    newsId,
    comments: response.comments,
    submitting: false,
    successMessage: response.message,
  })),
  on(Actions.createCommentFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    error,
  })),

  on(Actions.toggleCommentLike, (state, { commentId }) => ({
    ...state,
    likingCommentId: commentId,
    error: null,
  })),
  on(Actions.toggleCommentLikeSuccess, (state, { newsId, response }) => ({
    ...state,
    newsId,
    comments: response.comments,
    likingCommentId: null,
  })),
  on(Actions.toggleCommentLikeFailure, (state, { error }) => ({
    ...state,
    likingCommentId: null,
    error,
  })),

  on(Actions.clearComments, () => initialCommentsPublicState),
);
