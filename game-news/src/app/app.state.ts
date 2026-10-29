import { AuthState } from './store/auth/auth.state';
import { UserState } from './store/users/users.state';

import { CategoryState } from './store/category/category.state';
import { TagState } from './store/tag/tag.state';
import { CommentState } from './store/comment/comment.state';
import { NewsState } from './store/news/news.state';
import { NewsPublicState } from './store/news-public/store/news-public.state';
import { CommentsPublicState } from './store/comments-public/store/comments-public.state';

export interface AppState {
  auth: AuthState;
  user: UserState;
  news: NewsState;
  category: CategoryState;
  tag: TagState;
  comment: CommentState;
    newsPublic: NewsPublicState;
  commentsPublic: CommentsPublicState;
}