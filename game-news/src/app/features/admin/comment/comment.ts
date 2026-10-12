
import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type {
  CommentData,
  CommentParent,
  CommentQuery,
  CommentStatus,
} from '../../../store/comment/models/comment.model';

import * as CommentActions from '../../../store/comment/comment.actions';
import * as CommentSelectors from '../../../store/comment/comment.selectors';

import * as NewsActions from '../../../store/news/news.actions';
import * as NewsSelectors from '../../../store/news/news.selectors';

import * as AuthSelectors from '../../../store/auth/auth.selectors';

import type {
  NewsData,
  NewsContentBlock,
} from '../../../store/news/models/news.model';

type TabKey = 'all' | CommentStatus;

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment.html',
  styleUrl: './comment.css',
})
export class Comment {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  readonly PER_PAGE = 10;

  // ==========================================================
  // AUTH
  // ==========================================================

  readonly authUser = this.store.selectSignal(
    AuthSelectors.selectAuthUser,
  );

  readonly currentUser = computed(() => {
    const user = this.authUser();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.username,
      role: user.role,
    };
  });

  readonly currentUserRole = computed(
    () => this.currentUser()?.role ?? null,
  );

  readonly canCheck = computed(() => {
    const role = this.currentUserRole();

    return (
      role === 'super_admin' ||
      role === 'admin' ||
      role === 'editor'
    );
  });

  readonly canDelete = computed(() => {
    const role = this.currentUserRole();

    return (
      role === 'super_admin' ||
      role === 'admin'
    );
  });

  // ==========================================================
  // COMMENT STORE - SELECT SIGNAL
  // ==========================================================

  readonly items = this.store.selectSignal(
    CommentSelectors.selectAllComments,
  );

  readonly meta = this.store.selectSignal(
    CommentSelectors.selectCommentMeta,
  );

  readonly counts = this.store.selectSignal(
    CommentSelectors.selectCommentCounts,
  );

  readonly countAll = this.store.selectSignal(
    CommentSelectors.selectCommentCountAll,
  );

  readonly countPending = this.store.selectSignal(
    CommentSelectors.selectCommentCountPending,
  );

  readonly countApproved = this.store.selectSignal(
    CommentSelectors.selectCommentCountApproved,
  );

  readonly countSpam = this.store.selectSignal(
    CommentSelectors.selectCommentCountSpam,
  );

  readonly selectedComment = this.store.selectSignal(
    CommentSelectors.selectSelectedComment,
  );

  readonly selectedParent = this.store.selectSignal(
    CommentSelectors.selectSelectedCommentParent,
  );

  readonly loading = this.store.selectSignal(
    CommentSelectors.selectCommentLoading,
  );

  readonly loadingDetail = this.store.selectSignal(
    CommentSelectors.selectCommentLoadingDetail,
  );

  readonly loadingParent = this.store.selectSignal(
    CommentSelectors.selectCommentLoadingParent,
  );

  readonly submitting = this.store.selectSignal(
    CommentSelectors.selectCommentSubmitting,
  );

  readonly deleting = this.store.selectSignal(
    CommentSelectors.selectCommentDeleting,
  );

  readonly error = this.store.selectSignal(
    CommentSelectors.selectCommentError,
  );

  readonly successMessage = this.store.selectSignal(
    CommentSelectors.selectCommentSuccessMessage,
  );

  // ==========================================================
  // NEWS STORE
  // ==========================================================

  readonly newsItems = this.store.selectSignal(
    NewsSelectors.selectNewsItems,
  );

  readonly selectedNews = this.store.selectSignal(
    NewsSelectors.selectSelectedNews,
  );

  // ==========================================================
  // TABS
  // ==========================================================

  readonly TABS: {
    key: TabKey;
    label: string;
    color: string;
  }[] = [
    {
      key: 'all',
      label: 'Tất cả',
      color: '#6b6560',
    },
    {
      key: 'pending',
      label: 'Chưa kiểm tra',
      color: '#f59e0b',
    },
    {
      key: 'approved',
      label: 'Hợp lệ',
      color: '#22c55e',
    },
    {
      key: 'spam',
      label: 'Không hợp lệ',
      color: '#ef4444',
    },
  ];

  readonly STATUS_LABEL: Record<CommentStatus, string> = {
    pending: 'Chưa kiểm tra',
    approved: 'Hợp lệ',
    spam: 'Không hợp lệ',
  };

  // ==========================================================
  // FILTER STATE
  // ==========================================================

  readonly search = signal('');
  readonly page = signal(1);
  readonly tabFilter = signal<TabKey>('all');

  readonly deleteItem = signal<CommentData | null>(null);
  readonly viewItem = signal<CommentData | null>(null);
  readonly viewArticleId = signal<string | null>(null);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  readonly total = computed(
    () => this.meta()?.total ?? 0,
  );

  readonly totalPages = computed(
    () => this.meta()?.totalPages ?? 0,
  );

  readonly currentPage = computed(
    () => this.meta()?.page ?? this.page(),
  );

  readonly paged = computed<CommentData[]>(
    () => this.items(),
  );

  readonly recordStart = computed(() => {
    if (this.total() === 0) {
      return 0;
    }

    return (
      (this.currentPage() - 1) * this.PER_PAGE + 1
    );
  });

  readonly recordEnd = computed(() =>
    Math.min(
      this.currentPage() * this.PER_PAGE,
      this.total(),
    ),
  );

  readonly paginationItems = computed<
    (number | 'dots')[]
  >(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total === 0) {
      return [];
    }

    if (total <= 6) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    if (current <= 3) {
      return [
        1,
        2,
        3,
        4,
        'dots',
        total - 1,
        total,
      ];
    }

    if (current >= total - 2) {
      return [
        1,
        2,
        'dots',
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      1,
      2,
      'dots',
      current - 1,
      current,
      'dots',
      total - 1,
      total,
    ];
  });

  // ==========================================================
  // FILTER & QUERY
  // ==========================================================

  private buildQuery(): CommentQuery {
    const query: CommentQuery = {
      page: this.page(),
      limit: this.PER_PAGE,
    };

    const keyword = this.search().trim();

    if (keyword) {
      query.search = keyword;
    }

    const status = this.tabFilter();

    if (status !== 'all') {
      query.status = status;
    }

    return query;
  }

  loadList(): void {
    this.store.dispatch(
      CommentActions.loadComments({
        query: this.buildQuery(),
      }),
    );
  }

  setTab(tab: TabKey): void {
    this.tabFilter.set(tab);
    this.page.set(1);
    this.loadList();
  }

  setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    this.loadList();
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages()
    ) {
      return;
    }

    this.page.set(page);
    this.loadList();
  }

  tabCount(key: TabKey): number {
    switch (key) {
      case 'all':
        return this.countAll();

      case 'pending':
        return this.countPending();

      case 'approved':
        return this.countApproved();

      case 'spam':
        return this.countSpam();

      default:
        return 0;
    }
  }

  // ==========================================================
  // APPROVE / REJECT
  // ==========================================================


mark(
  comment: CommentData,
  status: 'approved' | 'spam',
): void {
  if (!this.canCheck()) {
    return;
  }

  // Đóng modal chi tiết bình luận ngay khi thao tác.
  this.closeComment();

  if (status === 'approved') {
    this.store.dispatch(
      CommentActions.approveComment({
        id: comment.comment_id,
      }),
    );

    return;
  }

  this.store.dispatch(
    CommentActions.rejectComment({
      id: comment.comment_id,
    }),
  );
}

  // ==========================================================
  // DELETE
  // ==========================================================

  askDelete(comment: CommentData): void {
    if (!this.canDelete()) {
      return;
    }

    this.deleteItem.set(comment);
  }

  confirmDelete(): void {
    const comment = this.deleteItem();

    if (!this.canDelete() || !comment) {
      return;
    }

    this.store.dispatch(
      CommentActions.deleteComment({
        id: comment.comment_id,
      }),
    );

    this.deleteItem.set(null);
  }

  // ==========================================================
  // COMMENT DETAIL
  // Không gọi API chi tiết bình luận hoặc bình luận cha.
  // Sử dụng trực tiếp dữ liệu đã có trong danh sách.
  // ==========================================================

  openComment(comment: CommentData): void {
    this.viewItem.set(comment);
  }

  closeComment(): void {
    this.viewItem.set(null);
  }

  // ==========================================================
  // USER INFORMATION
  // ==========================================================

  getUsername(comment: CommentData): string {
    return (
      comment.user?.username ??
      'Người dùng không xác định'
    );
  }

  getUserEmail(comment: CommentData): string {
    return comment.user?.email ?? '—';
  }

  // ==========================================================
  // NEWS INFORMATION
  // ==========================================================

  getNewsTitle(comment: CommentData): string {
    return (
      comment.news?.title ??
      'Bài viết không tồn tại'
    );
  }

  // Chỉ tải bài viết khi người dùng bấm "Xem bài viết".
  openArticle(newsId: string | number): void {
    const id = String(newsId);

    this.viewArticleId.set(id);

    this.store.dispatch(
      NewsActions.loadNewsById({
        id,
      }),
    );
  }

  closeArticle(): void {
    this.viewArticleId.set(null);
  }

  getArticle(
    newsId: string | number,
  ): NewsData | null {
    const id = String(newsId);
    const selected = this.selectedNews();

    if (
      selected &&
      String(selected.news_id) === id
    ) {
      return selected;
    }

    return (
      this.newsItems().find(
        (news) => String(news.news_id) === id,
      ) ?? null
    );
  }

  getArticleBlocks(
    newsId: string | number,
  ): NewsContentBlock[] {
    const article = this.getArticle(newsId);

    return [...(article?.content_blocks ?? [])].sort(
      (a, b) => a.position - b.position,
    );
  }

  getArticleAuthorName(
    author: NewsData['author'],
  ): string {
    if (!author) {
      return 'A';
    }

    if (typeof author === 'string') {
      return author;
    }

    return author.username ?? 'A';
  }

  // ==========================================================
  // PARENT COMMENT
  // Sử dụng trực tiếp comment.parent từ API danh sách.
  // ==========================================================

  getParentComment(
    comment: CommentData,
  ): CommentParent | null {
    return comment.parent ?? null;
  }

  getParentUsername(
    parent: CommentParent | null,
  ): string {
    return (
      parent?.username ??
      'Người dùng không xác định'
    );
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  statusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';

      case 'approved':
        return 'status-approved';

      case 'spam':
      case 'rejected':
        return 'status-rejected';

      default:
        return '';
    }
  }

  // ==========================================================
  // IMAGE URL
  // ==========================================================

  private readonly API_URL = 'http://localhost:3001';

  getThumbnailUrl(
    thumbnail: string | null | undefined,
  ): string {
    if (!thumbnail?.trim()) {
      return '';
    }

    const path = thumbnail.trim();

    // URL đầy đủ thì giữ nguyên.
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    // Ghép URL backend với đường dẫn ảnh.
    return `${this.API_URL}/${path.replace(/^\/+/, '')}`;
  }

  // ==========================================================
  // LIFECYCLE
  // ==========================================================

  constructor() {
    // Chỉ tải lại danh sách sau khi duyệt, từ chối hoặc xóa.
    this.actions$
      .pipe(
        ofType(
          CommentActions.approveCommentSuccess,
          CommentActions.rejectCommentSuccess,
          CommentActions.deleteCommentSuccess,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (
          this.page() > 1 &&
          this.items().length === 1 &&
          this.tabFilter() !== 'all'
        ) {
          this.page.update((page) => page - 1);
        }

        this.loadList();
      });

    this.loadList();
  }
}