
import {
  DatePipe,
  DecimalPipe,
  isPlatformBrowser,
} from '@angular/common';

import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  HostListener,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// NEWS
import * as NewsActions from '../../../store/news/news.actions';
import {
  selectNewsDashboardStats,
  selectNewsDashboardStatsLoading,
} from '../../../store/news/news.selectors';

// COMMENT
import * as CommentActions from '../../../store/comment/comment.actions';
import {
  selectCommentDashboardStats,
  selectCommentDashboardStatsLoading,
} from '../../../store/comment/comment.selectors';

// USER
import * as UserActions from '../../../store/users/users.actions';
import {
  selectUserDashboardStats,
  selectUserDashboardStatsLoading,
} from '../../../store/users/users.selectors';

// CATEGORY
import * as CategoryActions from '../../../store/category/category.actions';
import {
  selectCategoryDashboardStats,
  selectCategoryDashboardStatsLoading,
} from '../../../store/category/category.selectors';

// TAG
import * as TagActions from '../../../store/tag/tag.actions';
import {
  selectTagDashboardStats,
  selectTagDashboardStatsLoading,
} from '../../../store/tag/tag.selectors';

// NOTIFICATION
import * as NotificationActions from '../../../store/notifications/store/notification.actions';
import {
  selectActivities,
  selectNotificationLoading,
  selectNotificationError,
  selectDailyViews,
  selectTotalDailyViews,
} from '../../../store/notifications/store/notification.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('chartContainer')
  chartContainer!: ElementRef<HTMLDivElement>;

  readonly currentDate = new Date();

  // ============================================================
  // NEWS DASHBOARD SELECTORS
  // ============================================================

  readonly newsStats = this.store.selectSignal(
    selectNewsDashboardStats,
  );

  readonly newsStatsLoading = this.store.selectSignal(
    selectNewsDashboardStatsLoading,
  );

  // ============================================================
  // COMMENT DASHBOARD SELECTORS
  // ============================================================

  readonly commentStats = this.store.selectSignal(
    selectCommentDashboardStats,
  );

  readonly commentStatsLoading = this.store.selectSignal(
    selectCommentDashboardStatsLoading,
  );

  // ============================================================
  // USER DASHBOARD SELECTORS
  // ============================================================

  readonly userStats = this.store.selectSignal(
    selectUserDashboardStats,
  );

  readonly userStatsLoading = this.store.selectSignal(
    selectUserDashboardStatsLoading,
  );

  // ============================================================
  // CATEGORY DASHBOARD SELECTORS
  // ============================================================

  readonly categoryStats = this.store.selectSignal(
    selectCategoryDashboardStats,
  );

  readonly categoryStatsLoading = this.store.selectSignal(
    selectCategoryDashboardStatsLoading,
  );

  // ============================================================
  // TAG DASHBOARD SELECTORS
  // ============================================================

  readonly tagStats = this.store.selectSignal(
    selectTagDashboardStats,
  );

  readonly tagStatsLoading = this.store.selectSignal(
    selectTagDashboardStatsLoading,
  );

  // ============================================================
  // NOTIFICATION SELECTORS
  // ============================================================

  readonly activities = this.store.selectSignal(
    selectActivities,
  );

  readonly activitiesLoading = this.store.selectSignal(
    selectNotificationLoading,
  );

  readonly activitiesError = this.store.selectSignal(
    selectNotificationError,
  );

  // ============================================================
  // DAILY VIEWS - NGRX STORE
  // ============================================================

  readonly dailyViews = this.store.selectSignal(
    selectDailyViews,
  );

  readonly totalDailyViews = this.store.selectSignal(
    selectTotalDailyViews,
  );

  // ============================================================
  // TRENDING NEWS
  // ============================================================

  readonly trendingNews = () =>
    this.newsStats()?.topViewed ?? [];

  // ============================================================
  // ACTIVITY ICON
  // ============================================================

  getActivityIcon(type: string): string {
    switch (type) {
      case 'NEWS':
        return '📰';

      case 'USER':
        return '👤';

      case 'COMMENT':
        return '💬';

      default:
        return '🔔';
    }
  }

  // ============================================================
  // CHART DATA - NGRX STORE
  // ============================================================

  readonly viewData = () =>
    this.dailyViews().map(
      item => Number(item.totalViews) || 0,
    );

  readonly days = () =>
    this.dailyViews().map(
      item => new Date(`${item.date}T00:00:00`),
    );

  W = 0;

  readonly H = 80;

  padLeft = 0;

  padRight = 0;

  lineD = '';

  areaD = '';

  private readonly API_URL = 'http://localhost:3001';

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId: object,
    private readonly cdr: ChangeDetectorRef,
  ) {
    // ========================================================
    // KHỞI TẠO CHART
    // ========================================================

    afterNextRender(() => {
      this.updateWidthAndChart();
      this.cdr.detectChanges();
    });


    effect(() => {
      const views = this.dailyViews();

      console.log(
        '[DASHBOARD] Daily views thay đổi:',
        views,
      );

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      this.updateWidthAndChart();
    });


    this.actions$
      .pipe(
        ofType(
          NewsActions.loadNewsDashboardStatsSuccess,
          CommentActions.loadCommentDashboardStatsSuccess,
          UserActions.loadUserDashboardStatsSuccess,
          CategoryActions.loadCategoryDashboardStatsSuccess,
          TagActions.loadTagDashboardStatsSuccess,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(action => {
        console.log(
          '✅ [DASHBOARD] Load stats thành công:',
          action,
        );
      });

  

    this.actions$
      .pipe(
        ofType(
          NotificationActions.loadDailyViewsSuccess,
          NotificationActions.updateDailyViews,
          NotificationActions.loadDailyViewsFailure,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(action => {
        console.log(
          '[DASHBOARD] Notification action:',
          action,
        );
      });

  
    this.destroyRef.onDestroy(() => {
      console.log('[DASHBOARD] Component destroyed');

      this.store.dispatch(
        NotificationActions.disconnectNotifications(),
      );
    });
  }


  ngOnInit(): void {
    console.log('[DASHBOARD] Bắt đầu khởi tạo Dashboard');

    this.store.dispatch(
      NewsActions.loadNewsDashboardStats(),
    );

    this.store.dispatch(
      CommentActions.loadCommentDashboardStats(),
    );

    this.store.dispatch(
      UserActions.loadUserDashboardStats(),
    );

    this.store.dispatch(
      CategoryActions.loadCategoryDashboardStats(),
    );

    this.store.dispatch(
      TagActions.loadTagDashboardStats(),
    );

    // ========================================================
    // NOTIFICATION
    // ========================================================

    this.store.dispatch(
      NotificationActions.loadActivities(),
    );

    
    this.store.dispatch(
      NotificationActions.loadDailyViews(),
    );

   
    this.store.dispatch(
      NotificationActions.connectNotifications(),
    );
  }

  // ============================================================
  // THUMBNAIL URL
  // ============================================================

  getThumbnailUrl(
    thumbnail: string | null | undefined,
  ): string {
    if (!thumbnail?.trim()) {
      return '';
    }

    const path = thumbnail.trim();

    // URL đầy đủ thì giữ nguyên
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    // Ghép URL backend với đường dẫn ảnh
    return `${this.API_URL}/${path.replace(/^\/+/, '')}`;
  }


  @HostListener('window:resize')
  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.updateWidthAndChart();
  }



  private updateWidthAndChart(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const el = this.chartContainer?.nativeElement;

    if (!el) {
      return;
    }

    const style = window.getComputedStyle(el);

    this.padLeft = parseFloat(style.paddingLeft) || 0;
    this.padRight = parseFloat(style.paddingRight) || 0;

    const newWidth = el.clientWidth;

    if (newWidth <= 0) {
      return;
    }

    if (newWidth !== this.W) {
      this.W = newWidth;
    }

    this.calculateChart();
  }

  // ============================================================
  // CALCULATE CHART
  // ============================================================

  private calculateChart(): void {
    const data = this.viewData();

    if (data.length < 2 || this.W <= 0) {
      this.lineD = '';
      this.areaD = '';
      return;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const drawWidth = Math.max(
      0,
      this.W - this.padLeft - this.padRight,
    );

    const points = data.map((value, index) => {
      const x =
        this.padLeft +
        (index / (data.length - 1)) * drawWidth;

      const y =
        this.H -
        ((value - min) / range) * this.H;

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    const pathString = points.join(' L ');

    this.lineD = `M ${pathString}`;

    this.areaD =
      `M ${pathString} ` +
      `L ${this.W - this.padRight},${this.H} ` +
      `L ${this.padLeft},${this.H} Z`;
  }
}
