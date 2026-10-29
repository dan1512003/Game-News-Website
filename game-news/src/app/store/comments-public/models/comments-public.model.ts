export type CommentSort = 'newest' | 'popular';
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';
export type CommentRole =
  | 'super_admin'
  | 'admin'
  | 'editor'
  | 'author'
  | 'user';

export interface PublicCommentUser {
  id: string;
  username: string;
  role:CommentRole
}

export interface PublicComment {
  id: string;
  newsId: string;
  userId: string;
  parentId: string | null;
  rootId: string | null;
  content: string;
  status: CommentStatus | string;
  likes: number;
  liked: boolean;
  createdAt: Date | string;
  user: PublicCommentUser | null;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string | null;
}

export interface CreateCommentResponse {
  message: string;
  created: PublicComment;
  comments: PublicComment[];
}

export interface ToggleCommentLikeResponse {
  commentId: string;
  liked: boolean;
  likes: number;
  comments: PublicComment[];
}
