

import { ApiErrorResponse } from '../../../shared/models/auth/auth.model';
import { PublicComment } from '../models/comments-public.model';

export interface CommentsPublicState {
  newsId: string | null;
  comments: PublicComment[];

  loading: boolean;
  submitting: boolean;
  likingCommentId: string | null;

  error: ApiErrorResponse | null;
  successMessage: string | null;
}

export const initialCommentsPublicState: CommentsPublicState = {
  newsId: null,
  comments: [],

  loading: false,
  submitting: false,
  likingCommentId: null,

  error: null,
  successMessage: null,
};
