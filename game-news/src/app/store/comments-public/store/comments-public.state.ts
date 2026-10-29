import { PublicComment } from '../models/comments-public.model';

export interface CommentsPublicState {
  newsId: string | null;
  comments: PublicComment[];
  loading: boolean;
  submitting: boolean;
  likingCommentId: string | null;
  error: string | null;
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
