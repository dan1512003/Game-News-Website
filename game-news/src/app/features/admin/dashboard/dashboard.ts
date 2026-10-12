
import {
  DatePipe,
  DecimalPipe,
  isPlatformBrowser,
} from '@angular/common';

import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

import { Store } from '@ngrx/store';

// Điều chỉnh các đường dẫn import theo cấu trúc thư mục thực tế.
import * as NewsActions from '../../../store/news/news.actions';
import {
  selectNewsDashboardStats,
  selectNewsDashboardStatsLoading,
} from '../../../store/news/news.selectors';

import * as CommentActions from '../../../store/comment/comment.actions';
import {
  selectCommentDashboardStats,
  selectCommentDashboardStatsLoading,
} from '../../../store/comment/comment.selectors';

import * as UserActions from '../../../store/users/users.actions';
import {
  selectUserDashboardStats,
  selectUserDashboardStatsLoading,
} from '../../../store/users/users.selectors'

import * as CategoryActions from '../../../store/category/category.actions';
import {
  selectCategoryDashboardStats,
  selectCategoryDashboardStatsLoading,
} from '../../../store/category/category.selectors';

import * as TagActions from '../../../store/tag/tag.actions';
import {
  selectTagDashboardStats,
  selectTagDashboardStatsLoading,
} from '../../../store/tag/tag.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly store = inject(Store);
  @ViewChild('chartContainer')
  chartContainer!: ElementRef<HTMLDivElement>;

  readonly currentDate = new Date();

  // ============================================================
  // NG-RX DASHBOARD SELECTORS
  // ============================================================

  readonly newsStats = this.store.selectSignal(
    selectNewsDashboardStats,
  );

  readonly newsStatsLoading = this.store.selectSignal(
    selectNewsDashboardStatsLoading,
  );

  readonly commentStats = this.store.selectSignal(
    selectCommentDashboardStats,
  );

  readonly commentStatsLoading = this.store.selectSignal(
    selectCommentDashboardStatsLoading,
  );

  readonly userStats = this.store.selectSignal(
    selectUserDashboardStats,
  );

  readonly userStatsLoading = this.store.selectSignal(
    selectUserDashboardStatsLoading,
  );

  readonly categoryStats = this.store.selectSignal(
    selectCategoryDashboardStats,
  );

  readonly categoryStatsLoading = this.store.selectSignal(
    selectCategoryDashboardStatsLoading,
  );

  readonly tagStats = this.store.selectSignal(
    selectTagDashboardStats,
  );

  readonly tagStatsLoading = this.store.selectSignal(
    selectTagDashboardStatsLoading,
  );

  // Dữ liệu bài viết xem nhiều từ API.
  readonly trendingNews = () =>
    this.newsStats()?.topViewed ?? [];

  // ============================================================
  // BIỂU ĐỒ LƯỢT XEM
  // Giữ nguyên dữ liệu và thuật toán hiện tại.
  // ============================================================

  viewData: number[] = [
    18200, 22400, 19800, 31200, 28700, 24500, 35600,
    41200, 38900, 29300, 45100, 52800, 48300, 61700,
    55200, 49800, 67400, 72100, 68500, 59200, 81300,
    76800, 84200, 78600, 91400, 88700, 95300, 89100,
    102400, 97800,
  ];

  days: Date[] = [];

  W = 0;

  readonly H = 80;

  padLeft = 0;

  padRight = 0;

  lineD = '';

  areaD = '';

  constructor(
  
    @Inject(PLATFORM_ID)
    private readonly platformId: object,
    private readonly cdr: ChangeDetectorRef,
  ) {
    afterNextRender(() => {
      this.updateWidthAndChart();
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    // Tải thống kê từ NgRx Effects/API.
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

    // Giữ nguyên logic tạo ngày của biểu đồ.
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i * 5);
      this.days.push(date);
    }
  }

  // ============================================================
  // BIỂU ĐỒ - GIỮ NGUYÊN LOGIC
  // ============================================================

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
      this.calculateChart();
    }
  }

  private calculateChart(): void {
    if (this.viewData.length < 2 || this.W <= 0) {
      return;
    }

    const min = Math.min(...this.viewData);
    const max = Math.max(...this.viewData);
    const range = max - min || 1;

    const drawWidth = Math.max(
      0,
      this.W - this.padLeft - this.padRight,
    );

    const points = this.viewData.map((value, index) => {
      const x =
        this.padLeft +
        (index / (this.viewData.length - 1)) * drawWidth;

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