
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';

import {
  isPlatformBrowser,
  CommonModule,
} from '@angular/common';

import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import {
  BlockType,
  EditorBlock,
  NewsEditor,
} from '../../../shared/components/news-editor/news-editor';

import type {
  NewsData,
  NewsFilter,
  NewsRole,
  NewsQuery,
  NewsNoteDto,
  ScheduleNewsDto,
  NewsContentBlock,
} from '../../../store/news/models/news.model';

import * as NewsActions from '../../../store/news/news.actions';
import * as NewsSelectors from '../../../store/news/news.selectors';

import * as AuthSelectors from '../../../store/auth/auth.selectors';

import * as CategoryActions from '../../../store/category/category.actions';
import * as CategorySelectors from '../../../store/category/category.selectors';

import {
  Actions,
  ofType,
} from '@ngrx/effects';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  filter,
} from 'rxjs';

// =====================================================
// API ERROR UTILITY
// =====================================================

import {
  ApiPageError,
  getApiErrorMessage,
  getApiErrorStatus,
  getApiErrorStatusName,
  isApiForbiddenError,
  toApiPageError,
} from '../../../shared/utils/api-error.util';

// =====================================================
// INTERFACES
// =====================================================

interface TabDef {
  key: NewsFilter;
  label: string;
  icon: string;
}

type NewsAction =
  | 'view'
  | 'apply'
  | 'submitted'
  | 'unsubmitted'
  | 'require'
  | 'unrequire'
  | 'edit'
  | 'unpublish'
  | 'publish'
  | 'unschedule'
  | 'schedule'
  | 'return'
  | 'delete';

// =====================================================
// COMPONENT
// =====================================================

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NewsEditor,
  ],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News {
  private readonly store = inject(Store);

  private readonly actions$ = inject(Actions);

  private readonly destroyRef = inject(DestroyRef);

  // =====================================================
  // PLATFORM
  // =====================================================

  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser = isPlatformBrowser(
    this.platformId,
  );

  readonly PER_PAGE = 10;

  private readonly API_URL = 'http://localhost:3001';

  // =====================================================
  // AUTH
  // =====================================================

  readonly authUser = this.store.selectSignal(
    AuthSelectors.selectAuthUser,
  );

  readonly authInitialized = this.store.selectSignal(
    AuthSelectors.selectAuthInitialized,
  );

  readonly currentUser = computed(() => {
    const user = this.authUser();

    console.log('[AUTH] user thực tế:', user);
    console.log('[AUTH] userId:', user?.userId);
    console.log('[AUTH] id:', (user as any)?.id);
    console.log('[AUTH] user_id:', (user as any)?.user_id);

    if (!user) {
      return null;
    }

    return {
      id: user.userId,
      name: user.username,
      role: user.role as NewsRole,
    };
  });

  readonly currentUserRole = computed(
    () => this.currentUser()?.role ?? null,
  );

  readonly currentUserName = computed(
    () => this.currentUser()?.name ?? '',
  );

  // =====================================================
  // NEWS STORE
  // =====================================================

  readonly news = this.store.selectSignal(
    NewsSelectors.selectNewsItems,
  );

  readonly pagination = this.store.selectSignal(
    NewsSelectors.selectNewsPagination,
  );

  readonly query = this.store.selectSignal(
    NewsSelectors.selectNewsQuery,
  );

  readonly loading = this.store.selectSignal(
    NewsSelectors.selectNewsLoading,
  );

  readonly saving = this.store.selectSignal(
    NewsSelectors.selectNewsSaving,
  );

  readonly deleting = this.store.selectSignal(
    NewsSelectors.selectNewsDeleting,
  );

  readonly error = this.store.selectSignal(
    NewsSelectors.selectNewsError,
  );

  readonly successMessage = this.store.selectSignal(
    NewsSelectors.selectNewsSuccessMessage,
  );

  readonly countsByFilter = this.store.selectSignal(
    NewsSelectors.selectNewsCountsByFilter,
  );

  readonly total = computed(
    () => this.pagination().total,
  );

  readonly totalPages = computed(
    () => this.pagination().totalPages,
  );

  readonly currentPage = computed(
    () => this.pagination().page,
  );

  // =====================================================
  // CATEGORY STORE
  // =====================================================

  readonly categories = this.store.selectSignal(
    CategorySelectors.selectCategoryOptions,
  );

  readonly categoriesLoading = this.store.selectSignal(
    CategorySelectors.selectCategoryOptionsLoading,
  );

  readonly categoriesError = this.store.selectSignal(
    CategorySelectors.selectCategoryOptionsError,
  );

  // =====================================================
  // NG-RX ACTION TRACKING
  // =====================================================

  private trackAllActions(): void {
    this.actions$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((action) => {
        console.log(
          '%c[NgRx ACTION]',
          'color: #2196f3; font-weight: bold;',
          action.type,
          action,
        );
      });
  }

  private trackFailedActions(): void {
    this.actions$
      .pipe(
        filter((action) =>
          /(failure|failed|error)/i.test(action.type),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((action) => {
        const payload = action as {
          error?: unknown;
          err?: unknown;
        };

        const error =
          payload.error ??
          payload.err ??
          action;

        // Sử dụng utility chung
        const status = getApiErrorStatus(error);

        const statusName = getApiErrorStatusName(
          error,
          status,
        );

        const message = getApiErrorMessage(error);

        console.group(
          `%c[NgRx ACTION FAILED] ${action.type}`,
          'color: #ff4444; font-weight: bold; font-size: 13px;',
        );

        console.error(
          'Action thất bại:',
          action.type,
        );

        console.error(
          'Action payload:',
          action,
        );

        console.error(
          'Error:',
          error,
        );

        console.error(
          'HTTP Status:',
          status,
        );

        console.error(
          'HTTP Status Name:',
          statusName,
        );

        console.error(
          'Error Message:',
          message,
        );

        console.groupEnd();
      });
  }

  private initializeActionTracking(): void {
    this.trackAllActions();
    this.trackFailedActions();
  }

  // =====================================================
  // GLOBAL PAGE STATE
  // =====================================================

  private readonly hasLoadedNews = signal(false);

  // =====================================================
  // PAGE LOADING
  // =====================================================

  readonly pageLoading = computed(() => {
    return (
      !this.authInitialized() ||
      !this.hasLoadedNews() ||
      this.categoriesLoading()
    );
  });

  // =====================================================
  // PAGE ERROR
  // =====================================================

  private readonly currentPageError = computed(() => {
    return (
      this.error() ??
      this.categoriesError() ??
      null
    );
  });

  // =====================================================
  // FORBIDDEN ERROR
  // =====================================================

  readonly forbiddenError = computed(() => {
    return isApiForbiddenError(
      this.currentPageError(),
    );
  });

  // =====================================================
  // NORMAL API ERROR
  // =====================================================

  readonly pageError = computed<ApiPageError | null>(() => {
    const error = this.currentPageError();

    // Không có lỗi
    if (!error) {
      return null;
    }

    // 403 sử dụng modal riêng
    if (isApiForbiddenError(error)) {
      return null;
    }

    // Chuẩn hóa lỗi bằng utility chung
    return toApiPageError(error);
  });

  // =====================================================
  // TABS
  // =====================================================

  readonly adminTabs: TabDef[] = [
    {
      key: 'published',
      label: 'Tất cả bài đã đăng',
      icon: '✅',
    },
    {
      key: 'mine',
      label: 'Bài của tôi',
      icon: '👤',
    },
    {
      key: 'submitted',
      label: 'Chờ duyệt',
      icon: '⏳',
    },
    {
      key: 'processing',
      label: 'Bài xử lý',
      icon: '⚙️',
    },
    {
      key: 'scheduled',
      label: 'Lên lịch',
      icon: '📅',
    },
    {
      key: 'draft',
      label: 'Nháp',
      icon: '📝',
    },
    {
      key: 'returned',
      label: 'Trả về',
      icon: '↩',
    },
    {
      key: 'required',
      label: 'Yêu cầu',
      icon: '⚠️',
    },
  ];

  readonly editorTabs: TabDef[] = [
    ...this.adminTabs,
  ];

  readonly authorTabs: TabDef[] = [
    {
      key: 'published',
      label: 'Tất cả bài đã đăng',
      icon: '✅',
    },
    {
      key: 'mine',
      label: 'Bài của tôi',
      icon: '👤',
    },
    {
      key: 'draft',
      label: 'Nháp',
      icon: '📝',
    },
    {
      key: 'returned',
      label: 'Trả về',
      icon: '↩',
    },
  ];

  readonly currentTabs = computed(() => {
    switch (this.currentUserRole()) {
      case 'super_admin':
      case 'admin':
        return this.adminTabs;

      case 'editor':
        return this.editorTabs;

      default:
        return this.authorTabs;
    }
  });

  // =====================================================
  // FILTERS
  // =====================================================

  readonly search = signal('');

  readonly catFilter = signal('');

  readonly roleFilter = signal<NewsFilter>('published');

  readonly pagedNews = computed<NewsData[]>(() => {
    return this.news();
  });

  readonly recordStart = computed(() => {
    if (this.total() === 0) {
      return 0;
    }

    return (
      (this.currentPage() - 1) * this.pagination().limit + 1
    );
  });

  readonly recordEnd = computed(() =>
    Math.min(
      this.currentPage() * this.pagination().limit,
      this.total(),
    ),
  );

  readonly paginationItems = computed<
    (number | 'dots')[]
  >(() => {
    const total = this.total();
    const current = this.currentPage();

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

  // =====================================================
  // EDITOR / MODALS
  // =====================================================

  editorOpen = false;

  editorViewOnly = false;

  editingNews: NewsData | null = null;

  returnItem: NewsData | null = null;

  returnNote = '';

  requiredItem: NewsData | null = null;

  requiredNote = '';

  removeItem: NewsData | null = null;

  scheduleItem: NewsData | null = null;

  scheduleDate = '';

  scheduleTime = '08:00';

  // =====================================================
  // INIT
  // =====================================================

  constructor() {
    this.initializeActionTracking();

    if (!this.isBrowser) {
      return;
    }

    // Theo dõi News tải thành công hoặc thất bại lần đầu
    this.actions$
      .pipe(
        ofType(
          NewsActions.loadNewsSuccess,
          NewsActions.loadNewsFailure,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.hasLoadedNews.set(true);
      });

    // Chỉ tải Category tại component cha
    this.store.dispatch(
      CategoryActions.loadCategoryOptions(),
    );

    this.actions$
      .pipe(
        ofType(
          NewsActions.newsWorkflowSuccess,
          NewsActions.deleteNewsSuccess,
          NewsActions.createNewsSuccess,
          NewsActions.updateNewsSuccess,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((action) => {
        console.log(
          '[NEWS] Thao tác thành công:',
          action.type,
        );

        this.fetchNews();
      });

    effect(() => {
      const initialized = this.authInitialized();
      const user = this.authUser();

      // Chờ AuthInitializer hoàn tất
      if (!initialized) {
        return;
      }

      // Đã khởi tạo nhưng không có user
      if (!user || !user.role) {
        this.hasLoadedNews.set(true);
        return;
      }

      // Có user thì tải News
      this.fetchNews();
    });
  }

  // =====================================================
  // BUILD NEWS QUERY
  // =====================================================

  private buildQuery(page = 1): NewsQuery {
    const query: NewsQuery = {
      page,
      limit: this.PER_PAGE,
      filter: this.roleFilter(),
    };

    const keyword = this.search().trim();

    if (keyword) {
      query.search = keyword;
    }

    const categoryId = this.catFilter();

    if (categoryId) {
      query.categoryId = categoryId;
    }

    return query;
  }

  // =====================================================
  // LOAD NEWS
  // =====================================================

  fetchNews(): void {
    if (!this.isBrowser) {
      return;
    }

    console.log('========== FETCH NEWS ==========');

    console.log(
      '[FETCH NEWS] currentUser:',
      this.currentUser(),
    );

    console.log(
      '[FETCH NEWS] authUser:',
      this.authUser(),
    );

    console.log(
      '[FETCH NEWS] currentUserRole:',
      this.currentUserRole(),
    );

    if (!this.currentUser()) {
      console.warn(
        '[FETCH NEWS] Chưa có người dùng đăng nhập.',
      );

      return;
    }

    if (this.forbiddenError()) {
      return;
    }

    console.log(
      '[FETCH NEWS] currentPage:',
      this.currentPage(),
    );

    this.fetchPage(this.currentPage() || 1);
  }

  private fetchPage(page: number): void {
    if (!this.isBrowser) {
      return;
    }

    console.log('========== FETCH PAGE ==========');

    console.log(
      '[FETCH PAGE] currentUser:',
      this.currentUser(),
    );

    console.log(
      '[FETCH PAGE] page:',
      page,
    );

    console.log(
      '[FETCH PAGE] query:',
      this.buildQuery(page),
    );

    if (!this.currentUser()) {
      console.warn(
        '[FETCH PAGE] Không tải tin vì currentUser rỗng.',
      );

      return;
    }

    if (this.forbiddenError()) {
      return;
    }

    this.store.dispatch(
      NewsActions.loadNews({
        query: this.buildQuery(page),
      }),
    );

    console.log(
      '[FETCH PAGE] Đã dispatch:',
      NewsActions.loadNews.type,
    );
  }

  // =====================================================
  // FILTERS / PAGINATION
  // =====================================================

  switchRoleFilter(key: NewsFilter): void {
    this.roleFilter.set(key);
    this.fetchPage(1);
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.fetchPage(1);
  }

  changeCategory(categoryId: string): void {
    this.catFilter.set(categoryId || '');
    this.fetchPage(1);
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages()
    ) {
      return;
    }

    this.fetchPage(page);
  }

  // =====================================================
  // DISPLAY HELPERS
  // =====================================================

  getUserName(
    userId: number | string | null | undefined,
  ): string {
    if (userId == null) {
      return '—';
    }

    const user = this.news()
      .flatMap((item) => [
        item.author,
        item.reviewer,
      ])
      .find(
        (candidate) =>
          String(candidate?.user_id) === String(userId),
      );

    if (user?.username) {
      return user.username;
    }

    const currentUser = this.currentUser();

    if (
      currentUser &&
      String(currentUser.id) === String(userId)
    ) {
      return currentUser.name;
    }

    return 'Người dùng';
  }

  getCategoryName(item: NewsData): string {
    return item.category?.name ?? 'Chưa phân loại';
  }

  getTagNames(item: NewsData): string[] {
    return (item.news_tags ?? [])
      .map((relation) => relation.tag?.name)
      .filter(
        (name): name is string => !!name,
      );
  }

  formatViews(value: number | string): string {
    const views = Number(value) || 0;

    if (views >= 1000) {
      return `${Math.round(views / 1000)}K`;
    }

    return views > 0 ? String(views) : '—';
  }

  formatDate(
    value: Date | string | null,
  ): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString('vi-VN');
  }

  tabCount(tab: TabDef): number {
    return this.countsByFilter()[tab.key] ?? 0;
  }

  categoryCount(categoryId: string): number {
    return this.news().filter(
      (item) =>
        String(item.category_id) === String(categoryId),
    ).length;
  }

  categoryTotalCount(): number {
    return this.news().length;
  }

  // =====================================================
  // ACTIONS BY STATUS / ROLE
  // =====================================================

  getActions(row: NewsData): NewsAction[] {
    const actions: NewsAction[] = [];

    const role = this.currentUserRole();

    const userId = this.currentUser()?.id;

    if (!role || userId == null) {
      return ['view'];
    }

    const isAdmin =
      role === 'admin' ||
      role === 'super_admin';

    const isEditor = role === 'editor';

    const isAuthor =
      String(row.author_id) === String(userId);

    const isReviewer =
      row.reviewer_id != null &&
      String(row.reviewer_id) === String(userId);

    const hasRequirement =
      !!row.requirement_note?.trim();

    if (row.status === 'published') {
      actions.push('view');

      if (isAdmin || isEditor) {
        actions.push('unpublish');
      }

      if (role === 'author' && isAuthor) {
        actions.push(
          hasRequirement ? 'unrequire' : 'require',
        );
      }
    }

    else if (row.status === 'submitted') {
      actions.push('view');

      if (isAdmin || isEditor) {
        actions.push('apply');
      }

      if (role === 'author' && isAuthor) {
        actions.push('unsubmitted');
      }
    }

    else if (row.status === 'processing') {
      actions.push('view');

      if (
        isAuthor &&
        row.reviewer_id != null &&
        !isReviewer
      ) {
        actions.push(
          hasRequirement ? 'unrequire' : 'require',
        );
      }

      if (
        (isAdmin || isEditor) &&
        isReviewer
      ) {
        actions.push(
          'edit',
          'publish',
          'schedule',
          'return',
          'delete',
        );
      }
    }

    else if (row.status === 'scheduled') {
      actions.push('view');

      if (isAdmin || isEditor) {
        actions.push(
          'publish',
          'unschedule',
        );
      }

      if (role === 'author' && isAuthor) {
        actions.push(
          hasRequirement ? 'unrequire' : 'require',
        );
      }
    }

    else if (row.status === 'draft') {
      actions.push('view');

      if (role === 'author' && isAuthor) {
        actions.push(
          'edit',
          'submitted',
          'delete',
        );
      }

      if (isAdmin || isEditor) {
        actions.push(
          'edit',
          'publish',
          'schedule',
        );
      }

      actions.push('delete');
    }

    else if (row.status === 'returned') {
      actions.push('view');

      if (role === 'author' && isAuthor) {
        actions.push(
          'edit',
          'submitted',
          'delete',
        );
      }

      if (isAdmin || isEditor) {
        actions.push(
          'edit',
          'publish',
          'schedule',
        );
      }
    }

    return [...new Set(actions)];
  }

  // =====================================================
  // WORKFLOW
  // =====================================================

  applyNews(row: NewsData): void {
    this.store.dispatch(
      NewsActions.applyNews({
        id: String(row.news_id),
      }),
    );
  }

  publishNews(row: NewsData): void {
    this.store.dispatch(
      NewsActions.publishNews({
        id: String(row.news_id),
      }),
    );
  }

  unPublishNews(row: NewsData): void {
    this.store.dispatch(
      NewsActions.unpublishNews({
        id: String(row.news_id),
      }),
    );
  }

  submitNews(row: NewsData): void {
    this.store.dispatch(
      NewsActions.submitNews({
        id: String(row.news_id),
      }),
    );
  }

  unsubmitNews(row: NewsData): void {
    this.store.dispatch(
      NewsActions.unsubmitNews({
        id: String(row.news_id),
      }),
    );
  }

  // =====================================================
  // RETURN NEWS
  // =====================================================

  confirmReturn(): void {
    const item = this.returnItem;

    const note = this.returnNote.trim();

    if (!item || !note) {
      return;
    }

    const dto: NewsNoteDto = { note };

    this.store.dispatch(
      NewsActions.returnNewsToAuthor({
        id: String(item.news_id),
        dto,
      }),
    );

    this.returnItem = null;
    this.returnNote = '';
  }

  // =====================================================
  // REQUIRE NEWS EDIT
  // =====================================================

  requireNews(row: NewsData): void {
    this.requiredItem = row;
    this.requiredNote = '';
  }

  confirmRequire(): void {
    const item = this.requiredItem;

    const note = this.requiredNote.trim();

    if (!item || !note) {
      return;
    }

    const dto: NewsNoteDto = { note };

    this.store.dispatch(
      NewsActions.requireNewsEdit({
        id: String(item.news_id),
        dto,
      }),
    );

    this.requiredItem = null;
    this.requiredNote = '';
  }

  unrequireNews(row: NewsData): void {
    this.store.dispatch(
      NewsActions.unrequireNewsEdit({
        id: String(row.news_id),
      }),
    );
  }

  // =====================================================
  // DELETE
  // =====================================================

  deleteNews(row: NewsData): void {
    if (!this.isBrowser) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bài "${row.title}" không?`,
    );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(
      NewsActions.deleteNews({
        id: String(row.news_id),
      }),
    );
  }

  // =====================================================
  // SCHEDULE
  // =====================================================

  openSchedule(row: NewsData): void {
    this.scheduleItem = row;

    const tomorrow = new Date();

    tomorrow.setDate(
      tomorrow.getDate() + 1,
    );

    const year = tomorrow.getFullYear();

    const month = String(
      tomorrow.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      tomorrow.getDate(),
    ).padStart(2, '0');

    this.scheduleDate = `${year}-${month}-${day}`;

    this.scheduleTime = '08:00';
  }

  confirmSchedule(): void {
    const item = this.scheduleItem;

    if (
      !item ||
      !this.scheduleDate ||
      !this.scheduleTime
    ) {
      return;
    }

    const scheduledAt = new Date(
      `${this.scheduleDate}T${this.scheduleTime}`,
    );

    if (Number.isNaN(scheduledAt.getTime())) {
      return;
    }

    const dto: ScheduleNewsDto = {
      scheduledAt: scheduledAt.toISOString(),
    };

    this.store.dispatch(
      NewsActions.scheduleNews({
        id: String(item.news_id),
        dto,
      }),
    );

    this.scheduleItem = null;
  }

  unschedule(row: NewsData): void {
    this.store.dispatch(
      NewsActions.unscheduleNews({
        id: String(row.news_id),
      }),
    );
  }

  // =====================================================
  // EDITOR
  // =====================================================

  openViewer(row: NewsData): void {
    this.editorViewOnly = true;
    this.editingNews = row;
    this.editorOpen = true;
  }

  openEditor(row?: NewsData): void {
    this.editorViewOnly = false;
    this.editingNews = row ?? null;
    this.editorOpen = true;
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.editingNews = null;

    this.store.dispatch(
      NewsActions.clearSelectedNews(),
    );

    this.fetchNews();
  }

  // =====================================================
  // HELPERS
  // =====================================================

  sameId(
    first: number | string | null | undefined,
    second: number | string | null | undefined,
  ): boolean {
    if (first == null || second == null) {
      return first == null && second == null;
    }

    return String(first) === String(second);
  }

  getThumbnailUrl(
    thumbnail: string | null | undefined,
  ): string {
    if (!thumbnail) {
      return '';
    }

    if (/^https?:\/\//i.test(thumbnail)) {
      return thumbnail;
    }

    return `${this.API_URL}/${thumbnail.replace(/^\/+/, '')}`;
  }

  onImageError(
    event: Event,
    thumbnail: string | null | undefined,
  ): void {
    console.error(
      'Không tải được ảnh:',
      thumbnail,
    );

    console.error(
      'URL ảnh:',
      (event.target as HTMLImageElement).src,
    );
  }

  toEditorBlocks(
    blocks: NewsContentBlock[] | null | undefined,
  ): EditorBlock[] {
    return (blocks ?? []).map((block, index) => ({
      id: index + 1,
      type: block.type as BlockType,
      content: block.content ?? '',
      imageFile: null,
    }));
  }

  toInitialTagIds(
    newsTags: NewsData['news_tags'] | null | undefined,
  ): Array<number | string> {
    return (newsTags ?? []).map(
      (item) => item.tag_id,
    );
  }
}
