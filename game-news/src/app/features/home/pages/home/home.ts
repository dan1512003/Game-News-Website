import {
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';



import { PublicNewsListItem, PublicNewsQuery } from '../../../../store/news-public/models/news-public.model';

import {
  loadPublicListing,
  loadTrendingNews,
} from '../../../../store/news-public/store/news-public.actions';

import {
  selectNewsPublicError,
  selectPublicListingLoading,
  selectPublicNewsItems,
  selectPublicListingPagination,
  selectTrendingNews,
  selectTrendingNewsLoading,
} from '../../../../store/news-public/store/news-public.selectors';
import { AppState } from '../../../../app.state';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly store = inject(Store<AppState>);

  // Dữ liệu từ NgRx Store
  readonly newsItems = this.store.selectSignal(
    selectPublicNewsItems,
  );

  readonly trending = this.store.selectSignal(
    selectTrendingNews,
  );

  readonly listingPagination = this.store.selectSignal(
    selectPublicListingPagination,
  );

  readonly listingLoading = this.store.selectSignal(
    selectPublicListingLoading,
  );

  readonly trendingLoading = this.store.selectSignal(
    selectTrendingNewsLoading,
  );

  readonly error = this.store.selectSignal(
    selectNewsPublicError,
  );

  // Bài nổi bật lấy từ dữ liệu API, không dùng mock
  readonly heroArticle = computed(
    () => this.newsItems()[0] ?? null,
  );

  readonly secondaryFeatured = computed(
    () => this.newsItems().slice(1, 3),
  );

  readonly news = computed(
    () => this.newsItems().slice(3),
  );

  readonly PER_PAGE = 9;

  page = 1;

  ngOnInit(): void {
    this.loadPage(1);

    this.store.dispatch(
      loadTrendingNews({ limit: 5 }),
    );
  }

private loadPage(page: number): void {
  this.page = page;

  const query: PublicNewsQuery = {
    page,
    limit: this.PER_PAGE,
  };

  this.store.dispatch(
    loadPublicListing({ query }),
  );
}

  get total(): number {
    return this.listingPagination()?.total ?? 0;
  }

  get totalPages(): number {
    return this.listingPagination()?.totalPages ?? 0;
  }

  get currentPage(): number {
    return this.listingPagination()?.page ?? this.page;
  }

  get paginationItems(): (number | 'dots')[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 0) {
      return [];
    }

    if (total <= 6) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 'dots', total - 1, total];
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
  }

  goTo(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage ||
      this.listingLoading()
    ) {
      return;
    }

    this.loadPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  previousPage(): void {
    this.goTo(this.currentPage - 1);
  }

  nextPage(): void {
    this.goTo(this.currentPage + 1);
  }

  getCategory(article: PublicNewsListItem): string {
    return article.category?.name ?? 'Gaming';
  }

  getAuthor(article: PublicNewsListItem): string {
    return article.author?.username ?? 'GameZone';
  }

  getDate(value: Date | string | null): string {
    if (!value) {
      return 'Chưa cập nhật';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Chưa cập nhật';
    }

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getToday(): string {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  getViews(value: number | string): string {
    const views = Number(value);

    if (!Number.isFinite(views)) {
      return String(value ?? 0);
    }

    if (views >= 1_000_000) {
      return `${(views / 1_000_000)
        .toFixed(1)
        .replace(/\.0$/, '')}M`;
    }

    if (views >= 1_000) {
      return `${(views / 1_000)
        .toFixed(1)
        .replace(/\.0$/, '')}K`;
    }

    return String(views);
  }

  getCategoryUrl(category: string): string {
    switch (category.toLowerCase()) {
      case 'pc & console':
      case 'pc/console':
        return '/pc-console';

      case 'mobile':
        return '/mobile';

      case 'esports':
        return '/esports';

      default:
        return '/';
    }
  }

  private readonly API_URL = 'http://localhost:3001';

getThumbnailUrl(thumbnail: string | null | undefined): string {
  if (!thumbnail?.trim()) {
    return 'assets/images/news-placeholder.jpg';
  }

  // Backend trả về URL đầy đủ.
  if (/^https?:\/\//i.test(thumbnail)) {
    return thumbnail;
  }

  // Backend trả về đường dẫn tương đối, ví dụ /uploads/news/abc.jpg.
  return `${this.API_URL}/${thumbnail.replace(/^\/+/, '')}`;
}
}