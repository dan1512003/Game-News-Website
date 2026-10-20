import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import {
  CommonModule,
} from '@angular/common';




export interface NewsItem {
  id: number;
  category: string;
  title: string;
  excerpt?: string;
  author?: string;
  date: string;
  readTime?: string;
  image: string;
  hot?: boolean;
  views?: string;
  score?: number | null;
}

export interface TrendingItem {
  title: string;
  category: string;
  views: string;
}

interface PageMeta {
  label: string;
  description: string;
  accent: string;
  heroImage: string;
  icon: string;
  categories?: string[];
  type?: 'category' | 'esports' | 'reviews';
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

  pageType = 'PC';

  page = 1;

  readonly PER_PAGE = 6;
  scoreFilter = 'Tất cả';

  readonly SCORE_FILTERS = [
    'Tất cả',
    '9+ Kiệt Tác',
    '8+ Rất Tốt',
    '7+ Tốt',
  ];

  readonly PAGE_META: Record<string, PageMeta> = {

    PC: {
      label: 'PC & Console',

      description:
        'Tin tức, đánh giá và xu hướng mới nhất về PC Gaming và Console — từ phần cứng cao cấp đến PlayStation, Xbox, Nintendo.',

      accent: '#3b82f6',

      heroImage:
        'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1400&h=400&fit=crop&auto=format',

      icon: '🖥️',

      categories: [
        'PC',
        'Console',
      ],
    },

    Mobile: {
      label: 'Mobile Gaming',

      description:
        'Thế giới game di động không ngừng phát triển. Khám phá những tựa game mobile hot nhất hiện nay.',

      accent: '#16a34a',

      heroImage:
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1400&h=400&fit=crop&auto=format',

      icon: '📱',

      categories: [
        'Mobile',
      ],
    },

    'Gaming Gear': {
      label: 'Gaming Gear',

      description:
        'Thiết bị gaming cao cấp — chuột, bàn phím, tai nghe, màn hình và PC build mới nhất cho game thủ.',

      accent: '#7c3aed',

      heroImage:
        'https://images.unsplash.com/photo-1593640408182-31c228b634b0?w=1400&h=400&fit=crop&auto=format',

      icon: '🖱️',

      categories: [
        'Gaming Gear',
      ],
    },

    Giftcode: {
      label: 'Giftcode',

      description:
        'Tổng hợp giftcode game mới nhất mỗi ngày — Liên Quân, PUBG Mobile, Valorant, LoL và nhiều tựa game hot khác. Nhận ngay trước khi hết hạn!',

      accent: '#f59e0b',

      heroImage:
        'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1400&h=400&fit=crop&auto=format',

      icon: '🎁',

      categories: [
        'Giftcode',
      ],
    },

    Esports: {
      label: 'Esports',

      description:
        'Tin tức, phân tích và cập nhật mới nhất từ làng thể thao điện tử thế giới — VCT, LCK, PMGC và các giải đấu lớn.',

      accent: '#ff5c00',

      heroImage:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=400&fit=crop&auto=format',

      icon: '🏆',

      categories: [
        'Esports',
      ],

      type: 'esports',
    },

    Reviews: {
      label: 'Đánh giá',

      description:
        'Review độc lập, khách quan từ đội ngũ chuyên nghiệp. Điểm số 1–10 dựa trên trải nghiệm thực tế hàng chục giờ chơi.',

      accent: '#eab308',

      heroImage:
        'https://images.unsplash.com/photo-1519326844852-704caea5679e?w=1400&h=400&fit=crop&auto=format',

      icon: '★',

      categories: [
        'Đánh giá',
      ],

      type: 'reviews',
    },

  };



  readonly ALL_NEWS: NewsItem[] = [



    {
      id: 1,
      category: 'PC',
      title: 'RTX 5090 chính thức ra mắt với hiệu năng vượt trội',
      excerpt:
        'NVIDIA RTX 5090 mang đến bước nhảy hiệu năng đáng kể cho game thủ PC với kiến trúc Blackwell mới.',
      author: 'Admin',
      date: '17/10/2026',
      readTime: '5 phút',
      image:
        'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=900&h=600&fit=crop&auto=format',
      hot: true,
      views: '24K',
    },

    {
      id: 2,
      category: 'PC',
      title: 'Top game PC đáng chơi nhất tháng 10/2026',
      excerpt:
        'Danh sách những tựa game PC đang được cộng đồng đánh giá cao nhất trong tháng.',
      author: 'Lê Minh',
      date: '16/10/2026',
      readTime: '7 phút',
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&h=600&fit=crop&auto=format',
      views: '18K',
    },

    {
      id: 3,
      category: 'PC',
      title: 'Steam công bố những tựa game bán chạy nhất tuần',
      excerpt:
        'Bảng xếp hạng Steam tuần này chứng kiến nhiều bất ngờ thú vị.',
      author: 'Gaming News',
      date: '15/10/2026',
      readTime: '4 phút',
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&h=600&fit=crop&auto=format',
      views: '15K',
    },



    {
      id: 4,
      category: 'Console',
      title: 'PlayStation 5 Pro tiếp tục gây sốt với game mới',
      excerpt:
        'Sony đang chuẩn bị hàng loạt tựa game mới dành riêng cho hệ máy PlayStation.',
      author: 'Nguyễn Nam',
      date: '14/10/2026',
      readTime: '6 phút',
      image:
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=900&h=600&fit=crop&auto=format',
      hot: true,
      views: '21K',
    },

    {
      id: 5,
      category: 'Console',
      title: 'Nintendo Switch 2 tiếp tục phá kỷ lục doanh số',
      excerpt:
        'Nintendo ghi nhận doanh số ấn tượng của thế hệ máy console mới.',
      author: 'Gaming News',
      date: '13/10/2026',
      readTime: '5 phút',
      image:
        'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=900&h=600&fit=crop&auto=format',
      views: '17K',
    },



    {
      id: 6,
      category: 'Mobile',
      title: 'Game mobile mới đang gây bão cộng đồng',
      excerpt:
        'Một tựa game mobile mới bất ngờ leo top bảng xếp hạng chỉ sau vài ngày ra mắt.',
      author: 'Mobile Team',
      date: '17/10/2026',
      readTime: '5 phút',
      image:
        'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=900&h=600&fit=crop&auto=format',
      hot: true,
      views: '31K',
    },

    {
      id: 7,
      category: 'Mobile',
      title: 'Những game mobile đáng chơi nhất năm 2026',
      excerpt:
        'Tổng hợp những tựa game mobile nổi bật nhất dành cho Android và iOS.',
      author: 'Mobile Team',
      date: '16/10/2026',
      readTime: '8 phút',
      image:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop&auto=format',
      views: '22K',
    },

    {
      id: 8,
      category: 'Mobile',
      title: 'PUBG Mobile cập nhật mùa giải mới',
      excerpt:
        'Mùa giải mới mang đến bản đồ, vũ khí và nhiều tính năng hấp dẫn.',
      author: 'Mobile Team',
      date: '15/10/2026',
      readTime: '4 phút',
      image:
        'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=900&h=600&fit=crop&auto=format',
      views: '19K',
    },



    {
      id: 9,
      category: 'Gaming Gear',
      title: 'Top gaming mouse đáng mua nhất năm 2026',
      excerpt:
        'Những mẫu chuột gaming có cảm biến chính xác và trọng lượng tối ưu.',
      author: 'Gear Team',
      date: '14/10/2026',
      readTime: '6 phút',
      image:
        'https://images.unsplash.com/photo-1527814050087-3793815479db?w=900&h=600&fit=crop&auto=format',
      views: '12K',
    },

    {
      id: 10,
      category: 'Gaming Gear',
      title: 'Gaming keyboard: Những mẫu nổi bật cho game thủ',
      excerpt:
        'Từ switch cơ học đến Hall Effect, đây là những bàn phím đáng chú ý.',
      author: 'Gear Team',
      date: '12/10/2026',
      readTime: '7 phút',
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&h=600&fit=crop&auto=format',
      views: '11K',
    },


    {
      id: 11,
      category: 'Giftcode',
      title: 'Giftcode game mới nhất tháng 10/2026',
      excerpt:
        'Tổng hợp giftcode mới nhất cho nhiều tựa game phổ biến.',
      author: 'Giftcode Team',
      date: '17/10/2026',
      readTime: '3 phút',
      image:
        'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=900&h=600&fit=crop&auto=format',
      hot: true,
      views: '35K',
    },

    {
      id: 12,
      category: 'Giftcode',
      title: 'Code Liên Quân mới nhất hôm nay',
      excerpt:
        'Nhanh tay nhập code để nhận những phần thưởng hấp dẫn.',
      author: 'Giftcode Team',
      date: '16/10/2026',
      readTime: '3 phút',
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&h=600&fit=crop&auto=format',
      views: '29K',
    },


    {
      id: 13,
      category: 'Esports',
      title: 'VCT 2026: Những đội tuyển đang có phong độ cao',
      excerpt:
        'Cuộc đua tại VCT 2026 đang trở nên hấp dẫn với nhiều đội tuyển nổi bật.',
      author: 'Esports Team',
      date: '17/10/2026',
      readTime: '8 phút',
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&h=600&fit=crop&auto=format',
      hot: true,
      views: '41K',
    },

    {
      id: 14,
      category: 'Esports',
      title: 'LCK: Cuộc chiến giữa những đội tuyển hàng đầu',
      excerpt:
        'Mùa giải LCK tiếp tục chứng kiến những trận đấu căng thẳng.',
      author: 'Esports Team',
      date: '16/10/2026',
      readTime: '7 phút',
      image:
        'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=900&h=600&fit=crop&auto=format',
      views: '33K',
    },

    {
      id: 15,
      category: 'Esports',
      title: 'PMGC 2026 chính thức bước vào vòng loại',
      excerpt:
        'Các đội tuyển PUBG Mobile hàng đầu thế giới bắt đầu tranh tài.',
      author: 'Esports Team',
      date: '15/10/2026',
      readTime: '6 phút',
      image:
        'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=900&h=600&fit=crop&auto=format',
      views: '28K',
    },



    {
      id: 16,
      category: 'Đánh giá',
      title: 'Review Black Myth: Wukong',
      excerpt:
        'Một hành trình thần thoại đầy ấn tượng với đồ họa tuyệt đẹp.',
      author: 'Review Team',
      date: '17/10/2026',
      readTime: '12 phút',
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&h=600&fit=crop&auto=format',
      score: 9.2,
      views: '32K',
    },

    {
      id: 17,
      category: 'Đánh giá',
      title: 'Review Elden Ring',
      excerpt:
        'Một trong những game hành động nhập vai đáng chơi nhất.',
      author: 'Review Team',
      date: '15/10/2026',
      readTime: '15 phút',
      image:
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&h=600&fit=crop&auto=format',
      score: 9.5,
      hot: true,
      views: '45K',
    },

    {
      id: 18,
      category: 'Đánh giá',
      title: 'Review Cyberpunk 2077',
      excerpt:
        'Night City vẫn là một trong những thế giới game ấn tượng nhất.',
      author: 'Review Team',
      date: '13/10/2026',
      readTime: '10 phút',
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&h=600&fit=crop&auto=format',
      score: 8.7,
      views: '27K',
    },

  ];



  readonly TRENDING: TrendingItem[] = [

    {
      title: 'RTX 5090 chính thức ra mắt',
      category: 'PC',
      views: '24K',
    },

    {
      title: 'VCT 2026: Những đội tuyển mạnh nhất',
      category: 'Esports',
      views: '41K',
    },

    {
      title: 'Giftcode game mới nhất tháng 10',
      category: 'Giftcode',
      views: '35K',
    },

    {
      title: 'Review Elden Ring',
      category: 'Đánh giá',
      views: '45K',
    },

    {
      title: 'Game mobile đang gây bão',
      category: 'Mobile',
      views: '31K',
    },

  ];



  ngOnInit(): void {

    const pageType =
      this.route.snapshot.data['pageType'];

    if (pageType) {
      this.pageType = pageType;
    }

    this.initializePage();
  }



  initializePage(): void {

    this.page = 1;

    this.scoreFilter = 'Tất cả';

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




  get allArticles(): NewsItem[] {

    const categories =
      this.meta.categories
      ?? [this.pageType];

    return this.ALL_NEWS.filter(
      article =>
        categories.includes(article.category)
    );
  }



  // FILTERED ARTICLES

  get filteredArticles(): NewsItem[] {

    if (!this.isReviews) {
      return this.allArticles;
    }

    return this.allArticles.filter(article => {

      const score =
        article.score ?? 0;

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


 
  // TOTAL PAGES
  get totalPages(): number {

    return Math.ceil(
      this.filteredArticles.length /
      this.PER_PAGE
    );
  }



  // PAGINATION

  get paginatedArticles(): NewsItem[] {

    const start =
      (this.page - 1) *
      this.PER_PAGE;

    const end =
      start +
      this.PER_PAGE;

    return this.filteredArticles.slice(
      start,
      end
    );
  }



  get trendingItems() {

    return this.TRENDING
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
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

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.page = page;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }


  // PAGINATION ARRAY


  get paginationPages(): (number | string)[] {

    const total = this.totalPages;

    const current = this.page;

    if (total <= 7) {

      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    const pages: (number | string)[] = [];

    pages.push(1);

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



  trackByNews(
    index: number,
    article: NewsItem
  ): number {

    return article.id;
  }


  trackByPage(
    index: number,
    page: number | string
  ): number | string {

    return page;
  }

}