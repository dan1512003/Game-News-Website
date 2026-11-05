import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs';

import type { UserLogin } from '../../shared/models/auth/auth.model';
import * as AuthSelectors from '../../store/auth/auth.selectors';

import type {
  PublicNewsDetail,
  PublicNewsContentBlock,
  PublicRelatedNewsItem,
} from '../../store/news-public/models/news-public.model';
import * as NewsPublicActions from '../../store/news-public/store/news-public.actions';
import * as NewsPublicSelectors from '../../store/news-public/store/news-public.selectors';

import type { PublicComment } from '../../store/comments-public/models/comments-public.model';
import * as CommentsPublicActions from '../../store/comments-public/store/comments-public.actions';
import * as CommentsPublicSelectors from '../../store/comments-public/store/comments-public.selectors';

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  authorId: string | null;
  date: string;
  readTime: string;
  views: string;
  image: string;
  score: number | null;
  excerpt: string;
  contentBlocks: PublicNewsContentBlock[];
  tags: Array<{ id: string; name: string }>;
}

interface CommentView {
  id: string;
  userId: string;
  name: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
  avatarColor: string;
  parentId: string | null;
  rootId: string;
  role: string | null;
  raw: PublicComment;
}

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.css',
})
export class NewsDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);

  readonly COMMENT_PREVIEW_LENGTH = 180;
  readonly COLLAPSED_THREAD_SIZE = 3;
  readonly AVATAR_COLORS = [
    '#ff5c00', '#3b82f6', '#16a34a', '#7c3aed', '#dc2626', '#f59e0b', '#0891b2',
  ];

  readonly relatedPageSize = 1;
  relatedCurrentPage = 1;

  private readonly currentNewsIdState = signal<string | null>(null);
  private readonly routeArticleError = signal<string | null>(null);
  private readonly localCommentError = signal<string | null>(null);
  private readonly localCommentSuccess = signal<string | null>(null);

  readonly currentNewsId = this.currentNewsIdState;
  readonly authUser = this.store.selectSignal(AuthSelectors.selectAuthUser);
  readonly publicNewsDetail = this.store.selectSignal(NewsPublicSelectors.selectPublicNewsDetail);
  readonly publicNewsDetailLoading = this.store.selectSignal(NewsPublicSelectors.selectPublicNewsDetailLoading);
  readonly publicNewsError = this.store.selectSignal(NewsPublicSelectors.selectNewsPublicError);
  readonly relatedNewsResponse = this.store.selectSignal(NewsPublicSelectors.selectRelatedNewsResponse);
  readonly publicComments = this.store.selectSignal(CommentsPublicSelectors.selectPublicComments);
  readonly publicCommentsLoading = this.store.selectSignal(CommentsPublicSelectors.selectPublicCommentsLoading);
  readonly publicCommentSubmitting = this.store.selectSignal(CommentsPublicSelectors.selectPublicCommentSubmitting);
  readonly publicCommentsError = this.store.selectSignal(CommentsPublicSelectors.selectCommentsPublicError);
  readonly publicCommentsSuccessMessage = this.store.selectSignal(CommentsPublicSelectors.selectCommentsPublicSuccessMessage);

  readonly article = computed<Article | null>(() => {
    const item = this.publicNewsDetail();
    const currentId = this.currentNewsId();
    if (!item || !currentId || String(item.id) !== currentId) return null;
    return this.mapNewsToArticle(item);
  });

 get user(): UserLogin | null {
  return this.authUser();
}

get isArticleLoading(): boolean {
  return (
    Boolean(this.currentNewsId()) &&
    (
      this.publicNewsDetailLoading() ||
      (
        !this.article() &&
        !this.publicNewsError() &&
        !this.routeArticleError()
      )
    )
  );
}

get articleError(): string | null {
  return (
    this.routeArticleError() ??
    this.publicNewsError()?.message ??
    null
  );
}

get isCommentsLoading(): boolean {
  return this.publicCommentsLoading();
}

get isCommentSubmitting(): boolean {
  return this.publicCommentSubmitting();
}

get commentError(): string | null {
  return (
    this.localCommentError() ??
    this.publicCommentsError()?.message ??
    null
  );
}

get commentSuccessMessage(): string | null {
  return (
    this.localCommentSuccess() ??
    this.publicCommentsSuccessMessage() ??
    null
  );
}
  private get relatedItems(): PublicRelatedNewsItem[] {
    return this.relatedNewsResponse()?.items ?? [];
  }
  private get relatedTotalPageCount(): number {
    return Number(this.relatedNewsResponse()?.totalPages ?? 0);
  }
  private get rawComments(): PublicComment[] {
    return this.publicComments() ?? [];
  }

  newComment = '';
  sortBy: 'newest' | 'popular' = 'newest';
  visibleCommentCount = 2;
  expandedComments: Record<string, boolean> = {};
  replyOpen: Record<string, boolean> = {};
  replyTexts: Record<string, string> = {};
  expandedReplies: Record<string, boolean> = {};

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.currentNewsIdState.set(id);
        this.routeArticleError.set(null);
        this.relatedCurrentPage = 1;
        this.visibleCommentCount = 2;
        this.expandedComments = {};
        this.expandedReplies = {};
        this.replyOpen = {};

        this.store.dispatch(NewsPublicActions.clearPublicNewsDetail());
        this.store.dispatch(CommentsPublicActions.clearComments());

        if (!id) {
          this.routeArticleError.set('Không tìm thấy mã bài viết.');
          return;
        }

        this.store.dispatch(NewsPublicActions.loadPublicNewsDetail({ id }));
        this.store.dispatch(NewsPublicActions.loadRelatedNews({
          id,
          page: 1,
          limit: this.relatedPageSize,
        }));
        this.store.dispatch(CommentsPublicActions.loadComments({
          newsId: id,
          sortBy: this.sortBy,
        }));
      });
  }

  get comments(): CommentView[] {
    return this.rawComments.map((comment) => this.mapComment(comment));
  }

  get sortedComments(): CommentView[] {
    const roots = this.comments.filter((comment) => comment.parentId === null);
    return roots.sort((a, b) => this.sortBy === 'popular'
      ? b.likes - a.likes
      : this.dateValue(b.raw.createdAt) - this.dateValue(a.raw.createdAt));
  }

  get visibleComments(): CommentView[] {
    return this.sortedComments.slice(0, this.visibleCommentCount);
  }

  get relatedTotalPages(): number {
    return this.relatedTotalPageCount;
  }

  get paginatedRelatedArticles(): Article[] {
    return this.relatedItems.map((item) => this.mapRelatedToArticle(item));
  }

  get relatedPaginationItems(): Array<number | 'dots'> {
    const total = this.relatedTotalPages;
    const current = this.relatedCurrentPage;
    if (total <= 0) return [];
    if (total <= 6) return Array.from({ length: total }, (_, index) => index + 1);
    if (current <= 3) return [1, 2, 3, 4, 'dots', total - 1, total];
    if (current >= total - 2) return [1, 2, 'dots', total - 3, total - 2, total - 1, total];
    return [1, 2, 'dots', current - 1, current, 'dots', total - 1, total];
  }

  getCategoryUrl(category: string): string {
    switch (category.toLowerCase()) {
      case 'pc & console':
      case 'pc/console': return '/pc-console';
      case 'mobile': return '/mobile';
      case 'esports': return '/esports';
      default: return '/';
    }
  }

  getAvatarLetter(name: string | undefined | null): string {
    return name?.trim()?.charAt(0)?.toUpperCase() || 'A';
  }

  getAvatarColor(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
    return this.AVATAR_COLORS[Math.abs(hash) % this.AVATAR_COLORS.length] ?? '#ff5c00';
  }

  get articleAuthorRole(): string {
    if (this.isCurrentUserAuthor()) return 'Tác giả';
    return 'Tác giả bài viết';
  }

  isCurrentUserAuthor(): boolean {
    if (!this.user || !this.article()?.authorId) return false;
    return this.normalizeId(this.getUserId(this.user)) === this.normalizeId(this.article()!.authorId);
  }

  get currentUserRoleLabel(): string {
    const role = String((this.user as any)?.role ?? '').toLowerCase();
    if (role === 'admin' || role === 'super_admin') return 'Quản trị viên';
    if (this.isCurrentUserAuthor()) return 'Tác giả';
    return 'Thành viên';
  }

  getCommentRoleLabel(comment: CommentView): string | null {
    const role = String(comment.role ?? '').toLowerCase();
    if (role === 'admin' || role === 'super_admin') return 'Quản trị viên';

    if (this.user && this.normalizeId(comment.userId) === this.normalizeId(this.getUserId(this.user))) {
      const currentRole = String((this.user as any)?.role ?? '').toLowerCase();
      if (currentRole === 'admin' || currentRole === 'super_admin') return 'Quản trị viên';
    }

    if (this.article()?.authorId && this.normalizeId(comment.userId) === this.normalizeId(this.article()!.authorId)) {
      return 'Tác giả';
    }
    return null;
  }

  private getUserId(user: UserLogin | null): string {
    const value = user as any;
    return String(value?.userId ?? value?.user_id ?? value?.id ?? '');
  }

  private normalizeId(value: string | number | null | undefined): string {
    return String(value ?? '').trim();
  }

  private mapNewsToArticle(item: PublicNewsDetail): Article {
    const blocks = [...(item.contentBlocks ?? [])]
      .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0));
    const text = blocks
      .filter((block) => !['image', 'video'].includes(String(block.type).toLowerCase()))
      .map((block) => String(block.content ?? '').replace(/<[^>]*>/g, ' '))
      .join(' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const author = item.author;
    return {
      id: String(item.id),
      title: item.title ?? 'Bài viết',
      category: item.category?.name ?? 'Game',
      author: author?.username ?? 'GameZone',
      authorId: author?.id == null ? null : String(author.id),
      date: this.formatArticleDate(item.publishedAt),
      readTime: `${Math.max(1, Math.ceil(words / 200))} phút đọc`,
      views: String(item.views ?? 0),
      image: this.resolveImageUrl(item.thumbnail ?? ''),
      score: item.reviewScore == null ? null : Number(item.reviewScore),
      excerpt: String(item.summary ?? ''),
      contentBlocks: blocks,
      tags: item.tags ?? [],
    };
  }

  private mapRelatedToArticle(item: PublicRelatedNewsItem): Article {
    return {
      id: String(item.id),
      title: item.title,
      category: item.category?.name ?? 'Game',
      author: item.author?.username ?? 'GameZone',
      authorId: item.author?.id == null ? null : String(item.author.id),
      date: this.formatArticleDate(item.publishedAt),
      readTime: '',
      views: '',
      image: this.resolveImageUrl(item.thumbnail ?? ''),
      score: null,
      excerpt: String(item.summary ?? ''),
      contentBlocks: [],
      tags: item.tags ?? [],
    };
  }

  private mapComment(comment: PublicComment): CommentView {
    const role = (comment.user as { role?: string } | null)?.role ?? null;
    const parentId = comment.parentId == null ? null : String(comment.parentId);
    return {
      id: String(comment.id),
      userId: String(comment.userId),
      name: comment.user?.username ?? 'Người dùng',
      content: comment.content ?? '',
      time: this.formatRelativeDate(comment.createdAt),
      likes: Number(comment.likes ?? 0),
      liked: Boolean(comment.liked),
      avatarColor: this.getAvatarColor(String(comment.userId ?? comment.id)),
      parentId,
      rootId: String(comment.rootId ?? comment.parentId ?? comment.id),
      role,
      raw: comment,
    };
  }

  resolveImageUrl(value: string): string {
    const url = String(value ?? '').trim();
    if (!url) return '';
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
    const apiBase = 'http://localhost:3001';
    return `${apiBase}/${url.replace(/^\/+/, '')}`;
  }

  private formatArticleDate(value: Date | string | null | undefined): string {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(date);
  }

  private formatRelativeDate(value: Date | string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value ?? '');
    const diff = Math.max(0, Date.now() - date.getTime());
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return this.formatArticleDate(value);
  }

  private dateValue(value: Date | string): number {
    const date = new Date(value).getTime();
    return Number.isNaN(date) ? 0 : date;
  }

  share(type: string): void {
    if (!this.article()) return;
    const url = window.location.href;
    if (type === 'Copy') {
      navigator.clipboard?.writeText(url);
      return;
    }
    if (type === 'Twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(this.article()!.title)}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (type === 'Facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    }
  }

  setSortBy(value: 'newest' | 'popular'): void {
    if (this.sortBy === value) return;
    this.sortBy = value;
    if (this.currentNewsId()) {
      this.store.dispatch(CommentsPublicActions.loadComments({
        newsId: this.currentNewsId()!,
        sortBy: value,
      }));
    }
  }

  showMoreComments(): void {
    if (this.visibleCommentCount < this.sortedComments.length) this.visibleCommentCount++;
  }

  collapseComments(): void {
    this.visibleCommentCount = 2;
  }

  getReplies(rootId: string): CommentView[] {
    return this.comments
      .filter((comment) => comment.rootId === rootId && comment.parentId !== null)
      .sort((a, b) => this.dateValue(a.raw.createdAt) - this.dateValue(b.raw.createdAt));
  }

  getDirectReplies(parentId: string): CommentView[] {
    return this.comments
      .filter((comment) => comment.parentId === parentId)
      .sort((a, b) => this.dateValue(a.raw.createdAt) - this.dateValue(b.raw.createdAt));
  }

  findComment(id: string): CommentView | undefined {
    return this.comments.find((comment) => comment.id === id);
  }

  submitComment(): void {
    if (!this.user) {
      this.goToLogin();
      return;
    }
    const content = this.newComment.trim();
    if (!content || !this.currentNewsId() || this.isCommentSubmitting) return;
    this.localCommentError.set(null);
    this.localCommentSuccess.set(null);
    this.store.dispatch(CommentsPublicActions.createComment({
      newsId: this.currentNewsId()!,
      dto: { content },
    }));
    this.newComment = '';
  }

  likeComment(id: string): void {
    if (!this.user) {
      this.goToLogin();
      return;
    }
    if (!this.currentNewsId()) return;
    this.store.dispatch(CommentsPublicActions.toggleCommentLike({
      newsId: this.currentNewsId()!,
      commentId: id,
      sortBy: this.sortBy,
    }));
  }

  toggleReply(id: string): void {
    if (!this.user) {
      this.goToLogin();
      return;
    }
    this.replyOpen[id] = !this.replyOpen[id];
  }

  submitReply(parent: CommentView): void {
    if (!this.user) {
      this.goToLogin();
      return;
    }
    const content = this.replyTexts[parent.id]?.trim();
    if (!content || !this.currentNewsId() || this.isCommentSubmitting) return;
    this.localCommentError.set(null);
    this.localCommentSuccess.set(null);
    this.store.dispatch(CommentsPublicActions.createComment({
      newsId: this.currentNewsId()!,
      dto: { content, parentId: parent.id },
    }));
    this.replyTexts[parent.id] = '';
    this.replyOpen[parent.id] = false;
    this.expandedReplies[parent.rootId] = true;
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  shouldShowReplyMention(comment: CommentView): boolean {
    return comment.parentId !== null && comment.parentId !== comment.rootId;
  }

  getParentName(comment: CommentView): string {
    if (!comment.parentId) return '';
    return this.findComment(comment.parentId)?.name ?? '';
  }

  isLongComment(comment: CommentView): boolean {
    return comment.content.length > this.COMMENT_PREVIEW_LENGTH;
  }

  getVisibleCommentContent(comment: CommentView): string {
    if (!this.isLongComment(comment) || this.expandedComments[comment.id]) return comment.content;
    return `${comment.content.slice(0, this.COMMENT_PREVIEW_LENGTH).trimEnd()}…`;
  }

  toggleCommentContent(id: string): void {
    this.expandedComments[id] = !this.expandedComments[id];
  }

  countReplies(comment: CommentView): number {
    return this.comments.filter((item) => item.rootId === comment.rootId && item.parentId !== null).length;
  }

  shouldCollapseReplies(comment: CommentView): boolean {
    return this.countReplies(comment) >= this.COLLAPSED_THREAD_SIZE;
  }

  shouldShowReplies(comment: CommentView): boolean {
    return !this.shouldCollapseReplies(comment) || Boolean(this.expandedReplies[comment.rootId]);
  }

  toggleReplies(rootId: string): void {
    this.expandedReplies[rootId] = !this.expandedReplies[rootId];
  }

  getRelatedArticles(): Article[] {
    return this.paginatedRelatedArticles;
  }

  goToRelatedPage(page: number): void {
    if (page < 1 || page > this.relatedTotalPages || page === this.relatedCurrentPage || !this.currentNewsId()) return;
    this.relatedCurrentPage = page;
    this.store.dispatch(NewsPublicActions.loadRelatedNews({
      id: this.currentNewsId()!,
      page,
      limit: this.relatedPageSize,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  previousRelatedPage(): void {
    this.goToRelatedPage(this.relatedCurrentPage - 1);
  }

  nextRelatedPage(): void {
    this.goToRelatedPage(this.relatedCurrentPage + 1);
  }
}
