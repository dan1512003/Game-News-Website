
import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

import {
  PublicNewsListItem,
  PublicNewsQuery,
} from '../../store/news-public/models/news-public.model'

import {
  loadPublicListing,
  loadTrendingNews,
} from '../../store/news-public/store/news-public.actions';

import {
  selectNewsPublicError,
  selectPublicListingLoading,
  selectPublicNewsItems,
  selectTrendingNews,
  selectTrendingNewsLoading,
} from '../../store/news-public/store/news-public.selectors';

interface PageMeta {
  label: string;
  description: string;
  accent: string;
  icon: string;
  categories?: string[];
  type?: 'category' | 'esports' | 'reviews';
}

interface TrendingViewItem {
  id: string;
  title: string;
  category: string;
  views: string;
  image: string;
  rank: number;
}

@Component({
  selector: 'app-news-listing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './news-listing.html',
  styleUrl: './news-listing.css',
})
export class NewsListing implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);

  private readonly API_URL = 'http://localhost:3001';

  pageType = 'PC';
  page = 1;

  // Số bài viết hiển thị trên mỗi trang.
  readonly PER_PAGE = 9;

  scoreFilter = 'Tất cả';

  readonly SCORE_FILTERS = [
    'Tất cả',
    '9+ Kiệt Tác',
    '8+ Rất Tốt',
    '7+ Tốt',
  ];

  // Dữ liệu lấy trực tiếp từ NgRx Store.
  readonly articles = this.store.selectSignal(
    selectPublicNewsItems,
  );

  readonly loading = this.store.selectSignal(
    selectPublicListingLoading,
  );

  readonly error = this.store.selectSignal(
    selectNewsPublicError,
  );

  readonly trendingNews = this.store.selectSignal(
    selectTrendingNews,
  );

  readonly trendingLoading = this.store.selectSignal(
    selectTrendingNewsLoading,
  );

  readonly PAGE_META: Record<string, PageMeta> = {
    PC: {
      label: 'PC & Console',
      description:
        'Tin tức, đánh giá và xu hướng mới nhất về PC Gaming và Console — từ phần cứng cao cấp đến PlayStation, Xbox, Nintendo.',
      accent: '#3b82f6',
      icon: '🖥️',
      categories: ['PC', 'Console', 'PC & Console', 'PC/Console'],
    },

    Mobile: {
      label: 'Mobile Gaming',
      description:
        'Thế giới game di động không ngừng phát triển. Khám phá những tựa game mobile hot nhất hiện nay.',
      accent: '#16a34a',
      icon: '📱',
      categories: ['Mobile', 'Mobile Gaming'],
    },

    'Gaming Gear': {
      label: 'Gaming Gear',
      description:
        'Thiết bị gaming cao cấp — chuột, bàn phím, tai nghe, màn hình và PC build mới nhất cho game thủ.',
      accent: '#7c3aed',
      icon: '🖱️',
      categories: ['Gaming Gear'],
    },

    Giftcode: {
      label: 'Giftcode',
      description:
        'Tổng hợp giftcode game mới nhất mỗi ngày. Nhận ngay trước khi mã hết hạn!',
      accent: '#f59e0b',
      icon: '🎁',
      categories: ['Giftcode', 'Gift Code'],
    },

    Esports: {
      label: 'Esports',
      description:
        'Tin tức, phân tích và cập nhật mới nhất từ làng thể thao điện tử thế giới.',
      accent: '#ff5c00',
      icon: '🏆',
      categories: ['Esports'],
      type: 'esports',
    },

    Reviews: {
      label: 'Đánh giá',
      description:
        'Review độc lập, khách quan từ đội ngũ chuyên nghiệp. Khám phá các bài đánh giá game và điểm số chi tiết.',
      accent: '#eab308',
      icon: '★',
      categories: ['Đánh giá', 'Review', 'Reviews'],
      type: 'reviews',
    },
  };

  ngOnInit(): void {
    const routePageType = this.route.snapshot.data['pageType'];

    if (routePageType) {
      this.pageType = routePageType;
    }

    this.initializePage();
    this.loadData();
  }

  initializePage(): void {
    this.page = 1;
    this.scoreFilter = 'Tất cả';
  }

  private loadData(): void {
    const query: PublicNewsQuery = {
      page: 1,
      limit: 9,
    };

    this.store.dispatch(
      loadPublicListing({ query }),
    );

    this.store.dispatch(
      loadTrendingNews({ limit: 5 }),
    );
  }

  get meta(): PageMeta {
    return (
      this.PAGE_META[this.pageType]
      ?? this.PAGE_META['PC']
    );
  }

  get isReviews(): boolean {
    return this.pageType === 'Reviews';
  }

  /**
   * Chuẩn hóa tên danh mục để so sánh,
   * không phân biệt chữ hoa, chữ thường và dấu tiếng Việt.
   */
  private normalize(value: string | null | undefined): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '');
  }

  getCategory(article: PublicNewsListItem): string {
    return article.category?.name ?? 'Chưa phân loại';
  }


  getReviewScore(article: PublicNewsListItem): number | null {
    const item = article as any;
    const rawScore = item.review_score ?? item.reviewScore;

    if (
      rawScore === null ||
      rawScore === undefined ||
      rawScore === ''
    ) {
      return null;
    }

    const score = Number(rawScore);

    return Number.isFinite(score) ? score : null;
  }

  /*
   Danh mục khác: lọc theo danh mục của route.
   */
  get allArticles(): PublicNewsListItem[] {
    const articles = this.articles() ?? [];

    if (this.isReviews) {
      return articles.filter(
        article => this.getReviewScore(article) !== null,
      );
    }

    const allowedCategories = (
      this.meta.categories ?? [this.pageType]
    ).map(category => this.normalize(category));

    return articles.filter(article => {
      const category = this.normalize(
        article.category?.name,
      );

      return allowedCategories.includes(category);
    });
  }

  get filteredArticles(): PublicNewsListItem[] {
    if (!this.isReviews || this.scoreFilter === 'Tất cả') {
      return this.allArticles;
    }

    return this.allArticles.filter(article => {
      const score = this.getReviewScore(article);

      if (score === null) {
        return false;
      }

      switch (this.scoreFilter) {
        case '9+ Kiệt Tác':
          return score >= 9;

        case '8+ Rất Tốt':
          return score >= 8;

        case '7+ Tốt':
          return score >= 7;

        default:
          return true;
      }
    });
  }

  get totalItems(): number {
    return this.filteredArticles.length;
  }

  get totalPages(): number {
    return Math.ceil(
      this.totalItems / this.PER_PAGE,
    );
  }

  get paginatedArticles(): PublicNewsListItem[] {
    const start = (this.page - 1) * this.PER_PAGE;

    return this.filteredArticles.slice(
      start,
      start + this.PER_PAGE,
    );
  }

  /* Ảnh đầu tiên của danh sách bài viết được dùng

   */
  getHeroImage(): string {
    const firstArticle = this.filteredArticles[0];

    return this.getThumbnailUrl(firstArticle?.thumbnail);
  }

  getThumbnailUrl(
    thumbnail: string | null | undefined,
  ): string {
    if (!thumbnail?.trim()) {
      return 'assets/images/news-placeholder.jpg';
    }

    if (/^https?:\/\//i.test(thumbnail)) {
      return thumbnail;
    }

    return `${this.API_URL}/${thumbnail.replace(/^\/+/, '')}`;
  }

  getDate(date: string | Date | null | undefined): string {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(parsedDate);
  }

  getViews(views: number | string | null | undefined): string {
    const count = Number(views ?? 0);

    if (!Number.isFinite(count) || count < 0) {
      return '0';
    }

    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    }

    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K`;
    }

    return String(count);
  }

  getAuthor(article: PublicNewsListItem): string {
    return article.author?.username ?? '';
  }

  scoreColor(score: number): string {
    if (score >= 9) {
      return '#ff5c00';
    }

    if (score >= 8) {
      return '#f59e0b';
    }

    if (score >= 7) {
      return '#22c55e';
    }

    return '#6b7280';
  }

  scoreLabel(score: number): string {
    if (score >= 9.5) {
      return 'Kiệt Tác';
    }

    if (score >= 9) {
      return 'Xuất Sắc';
    }

    if (score >= 8) {
      return 'Rất Tốt';
    }

    if (score >= 7) {
      return 'Tốt';
    }

    return 'Trung Bình';
  }

  changeFilter(filter: string): void {
    this.scoreFilter = filter;
    this.page = 1;
  }

  goTo(page: number): void {
    const total = this.totalPages;

    if (
      total === 0 ||
      page < 1 ||
      page > total ||
      page === this.page
    ) {
      return;
    }

    this.page = page;
  }

  get paginationPages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.page;

    if (total === 0) {
      return [];
    }

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    const pages: (number | string)[] = [1];

    if (current > 3) {
      pages.push('...');
    }

    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    pages.push(total);

    return pages;
  }

  get trendingItems(): TrendingViewItem[] {
    return (this.trendingNews() ?? [])
      .slice(0, 5)
      .map((article, index) => ({
        id: article.newsId,
        title: article.title,
        category: this.getCategory(article),
        views: this.getViews(article.views),
        image: this.getThumbnailUrl(article.thumbnail),
        rank: index + 1,
      }));
  }

trackByNews(
  index: number,
  article: PublicNewsListItem,
): string {
  return article.newsId;
}

  trackByPage(
    index: number,
    page: number | string,
  ): number | string {
    return page;
  }
}
