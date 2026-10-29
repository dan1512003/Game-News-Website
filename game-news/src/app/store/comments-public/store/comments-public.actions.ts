import { createAction, props } from '@ngrx/store';
import {
  CommentSort,
  CreateCommentDto,
  CreateCommentResponse,
  PublicComment,
  ToggleCommentLikeResponse,
} from '../models/comments-public.model';

export const loadComments = createAction(
  '[Comments Public] Load',
  props<{ newsId: string; sortBy?: CommentSort }>(),
);
export const loadCommentsSuccess = createAction(
  '[Comments Public] Load Success',
  props<{ newsId: string; comments: PublicComment[] }>(),
);
export const loadCommentsFailure = createAction(
  '[Comments Public] Load Failure',
  props<{ error: string }>(),
);

export const createComment = createAction(
  '[Comments Public] Create',
  props<{ newsId: string; dto: CreateCommentDto }>(),
);
export const createCommentSuccess = createAction(
  '[Comments Public] Create Success',
  props<{ newsId: string; response: CreateCommentResponse }>(),
);
export const createCommentFailure = createAction(
  '[Comments Public] Create Failure',
  props<{ error: string }>(),
);

export const toggleCommentLike = createAction(
  '[Comments Public] Toggle Like',
  props<{
    newsId: string;
    commentId: string;
    sortBy?: CommentSort;
  }>(),
);
export const toggleCommentLikeSuccess = createAction(
  '[Comments Public] Toggle Like Success',
  props<{ newsId: string; response: ToggleCommentLikeResponse }>(),
);
export const toggleCommentLikeFailure = createAction(
  '[Comments Public] Toggle Like Failure',
  props<{ error: string }>(),
);

export const clearComments = createAction(
  '[Comments Public] Clear',
);
