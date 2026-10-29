
import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import {
  Subject,
  takeUntil,
} from 'rxjs';

import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

import {
  PublicNewsListItem,
  PublicNewsQuery,
} from '../../store/news-public/models/news-public.model';

import {
  loadPublicListing,
  loadTrendingNews,
} from '../../store/news-public/store/news-public.actions';

import {
  selectPublicNewsItems,
  selectPublicListingLoading,
  selectNewsPublicError,
  selectTrendingNews,
  selectTrendingNewsLoading,
} from '../../store/news-public/store/news-public.selectors';

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  hot?: boolean;
  content?: string[];
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class Search implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  private readonly destroy$ = new Subject<void>();

  readonly PER_PAGE = 1;
  readonly API_URL = 'http://localhost:3001';

  readonly newsItems = this.store.selectSignal(
    selectPublicNewsItems,
  );

  readonly trendingNews = this.store.selectSignal(
    selectTrendingNews,
  );

  readonly loading = this.store.selectSignal(
    selectPublicListingLoading,
  );

  readonly trendingLoading = this.store.selectSignal(
    selectTrendingNewsLoading,
  );

  readonly error = this.store.selectSignal(
    selectNewsPublicError,
  );

  query = '';
  draft = '';
  category = 'Tất cả';
  page = 1;

  ngOnInit(): void {
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

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.query = params.get('q')?.trim() ?? '';
        this.draft = this.query;
        this.category = 'Tất cả';
        this.page = 1;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
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

  getDate(
    date: string | Date | null | undefined,
  ): string {
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

  private mapArticle(
    item: PublicNewsListItem,
  ): Article {
    const article = item as any;

    const summary =
      article.summary ?? '';

    const tags: string[] = Array.isArray(article.tags)
      ? article.tags.map((tag: any) =>
          typeof tag === 'string'
            ? tag
            : tag.name ?? '',
        )
      : [];

    return {
      id: String(item.newsId),
      title: item.title ?? '',
      category: item.category?.name ?? 'Chưa phân loại',
      excerpt: summary,
      author: item.author?.username ?? '',
      date: this.getDate(item.publishedAt),
      readTime: '3 phút đọc',
      image: this.getThumbnailUrl(item.thumbnail),
      hot: Boolean(article.isTrending ?? article.hot),
      content: tags,
    };
  }

  get allArticles(): Article[] {
    return (this.newsItems() ?? []).map(item =>
      this.mapArticle(item),
    );
  }

  get trending(): Article[] {
    return (this.trendingNews() ?? [])
      .slice(0, 5)
      .map(item => this.mapArticle(item));
  }

  get matchingArticles(): Article[] {
    if (!this.query) {
      return [];
    }

    const keyword = this.normalize(this.query);

    return this.allArticles.filter(article => {
      const searchable = [
        article.title,
        article.category,
        article.excerpt,
        article.author,
        ...(article.content ?? []),
      ]
        .filter(Boolean)
        .join(' ');

      return this.normalize(searchable).includes(keyword);
    });
  }

  get categories(): string[] {
    return [
      'Tất cả',
      ...new Set(
        this.matchingArticles.map(
          article => article.category,
        ),
      ),
    ];
  }

  get results(): Article[] {
    if (this.category === 'Tất cả') {
      return this.matchingArticles;
    }

    return this.matchingArticles.filter(
      article => article.category === this.category,
    );
  }

  get totalPages(): number {
    return Math.ceil(
      this.results.length / this.PER_PAGE,
    );
  }

  get paginatedArticles(): Article[] {
    const start = (this.page - 1) * this.PER_PAGE;

    return this.results.slice(
      start,
      start + this.PER_PAGE,
    );
  }

  search(): void {
    const keyword = this.draft.trim();

    if (!keyword) {
      return;
    }

    this.router.navigate(['/search'], {
      queryParams: {
        q: keyword,
      },
    });
  }

  selectCategory(nextCategory: string): void {
    this.category = nextCategory;
    this.page = 1;
  }

  goTo(nextPage: number): void {
    const total = this.totalPages;

    if (
      total === 0 ||
      nextPage < 1 ||
      nextPage > total ||
      nextPage === this.page
    ) {
      return;
    }

    this.page = nextPage;
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

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [
        1,
        '...',
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      1,
      '...',
      current - 1,
      current,
      current + 1,
      '...',
      total,
    ];
  }

  articleUrl(article: Article): string {
    return `/bai-viet/${article.id}`;
  }

  trackArticle(
    index: number,
    article: Article,
  ): string {
    return article.id;
  }

  trackCategory(
    index: number,
    category: string,
  ): string {
    return category;
  }

  isFirstPage(): boolean {
    return this.page === 1;
  }

  isLastPage(): boolean {
    return (
      this.totalPages === 0 ||
      this.page === this.totalPages
    );
  }
}