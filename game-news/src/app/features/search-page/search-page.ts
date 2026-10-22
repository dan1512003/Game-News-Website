
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import {
  Subject,
  takeUntil,
} from 'rxjs';


interface Article {

  id: number;

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





const HERO_ARTICLE: Article = {

  id: 1,

  title:
    'GTA VI tiếp tục gây sốt với những thông tin mới nhất',

  category:
    'PC & Console',

  excerpt:
    'Những thông tin mới nhất về GTA VI đang khiến cộng đồng game thủ trên toàn thế giới đặc biệt quan tâm.',

  author:
    'Nguyễn Minh',

  date:
    '20/10/2026',

  readTime:
    '5 phút đọc',

  image:
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80',

  hot:
    true,

  content: [

    'GTA VI',

    'Rockstar Games',

    'Grand Theft Auto',

    'game thế giới mở',

  ],

};




const ALL_NEWS: Article[] = [

  {

    id: 2,

    title:
      'PlayStation 6 có thể sẽ thay đổi hoàn toàn trải nghiệm console',

    category:
      'PC & Console',

    excerpt:
      'Sony được cho là đang chuẩn bị những thay đổi lớn cho thế hệ PlayStation tiếp theo.',

    author:
      'Lê Hoàng',

    date:
      '19/10/2026',

    readTime:
      '4 phút đọc',

    image:
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=1000&q=80',

    hot:
      true,

    content: [

      'PlayStation 6',

      'Sony',

      'console',

      'PS6',

    ],

  },


  {

    id: 3,

    title:
      'Game mobile mới đang trở thành hiện tượng tại Việt Nam',

    category:
      'Mobile',

    excerpt:
      'Một tựa game mobile mới đang nhanh chóng thu hút hàng triệu người chơi tại thị trường Việt Nam.',

    author:
      'Trần Anh',

    date:
      '18/10/2026',

    readTime:
      '3 phút đọc',

    image:
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=80',

    content: [

      'mobile',

      'game mobile',

      'Việt Nam',

      'Android',

      'iOS',

    ],

  },


  {

    id: 4,

    title:
      'LMHT cập nhật phiên bản mới với hàng loạt thay đổi lớn',

    category:
      'Esports',

    excerpt:
      'Bản cập nhật mới của Liên Minh Huyền Thoại mang đến nhiều thay đổi về tướng và trang bị.',

    author:
      'Phạm Đức',

    date:
      '17/10/2026',

    readTime:
      '6 phút đọc',

    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',

    hot:
      true,

    content: [

      'Liên Minh Huyền Thoại',

      'LMHT',

      'League of Legends',

      'esports',

      'Riot Games',

    ],

  },


  {

    id: 5,

    title:
      'Steam đang có chương trình giảm giá hàng loạt game nổi tiếng',

    category:
      'PC & Console',

    excerpt:
      'Nhiều tựa game đình đám đang được giảm giá mạnh trên Steam trong sự kiện mới.',

    author:
      'Đỗ Nam',

    date:
      '16/10/2026',

    readTime:
      '3 phút đọc',

    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',

    content: [

      'Steam',

      'game PC',

      'giảm giá',

      'game sale',

    ],

  },


  {

    id: 6,

    title:
      'PUBG Mobile công bố mùa giải mới với nhiều phần thưởng',

    category:
      'Mobile',

    excerpt:
      'Mùa giải mới của PUBG Mobile mang đến nhiều nội dung và phần thưởng dành cho người chơi.',

    author:
      'Hoàng Long',

    date:
      '15/10/2026',

    readTime:
      '4 phút đọc',

    image:
      'https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1000&q=80',

    content: [

      'PUBG Mobile',

      'PUBG',

      'mobile',

      'battle royale',

    ],

  },


  {

    id: 7,

    title:
      'Valorant chuẩn bị giải đấu esports lớn nhất năm',

    category:
      'Esports',

    excerpt:
      'Các đội tuyển hàng đầu đang chuẩn bị cho giải đấu Valorant được mong đợi nhất năm.',

    author:
      'Nguyễn Khoa',

    date:
      '14/10/2026',

    readTime:
      '5 phút đọc',

    image:
      'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1000&q=80',

    hot:
      true,

    content: [

      'Valorant',

      'Riot Games',

      'esports',

      'FPS',

    ],

  },


  {

    id: 8,

    title:
      'Nintendo giới thiệu những kế hoạch mới dành cho hệ máy Switch',

    category:
      'PC & Console',

    excerpt:
      'Nintendo đang chuẩn bị nhiều sản phẩm và trải nghiệm mới dành cho cộng đồng game thủ.',

    author:
      'Mai Linh',

    date:
      '13/10/2026',

    readTime:
      '4 phút đọc',

    image:
      'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=1000&q=80',

    content: [

      'Nintendo',

      'Switch',

      'console',

      'Mario',

    ],

  },


  {

    id: 9,

    title:
      'Minecraft tiếp tục giữ vị trí game được yêu thích nhất',

    category:
      'PC & Console',

    excerpt:
      'Minecraft vẫn duy trì sức hút mạnh mẽ sau nhiều năm phát hành.',

    author:
      'Bảo Nam',

    date:
      '12/10/2026',

    readTime:
      '3 phút đọc',

    image:
      'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=1000&q=80',

    content: [

      'Minecraft',

      'Microsoft',

      'sandbox',

      'game PC',

    ],

  },


  {

    id: 10,

    title:
      'Một tựa game nhập vai mobile đang gây bão cộng đồng',

    category:
      'Mobile',

    excerpt:
      'Tựa game nhập vai mới đang nhanh chóng lọt top tải xuống trên các cửa hàng ứng dụng.',

    author:
      'Minh Quân',

    date:
      '11/10/2026',

    readTime:
      '5 phút đọc',

    image:
      'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1000&q=80',

    content: [

      'RPG',

      'mobile',

      'game nhập vai',

      'Android',

      'iOS',

    ],

  },


  {

    id: 11,

    title:
      'CS2 chuẩn bị bản cập nhật lớn dành cho game thủ PC',

    category:
      'Esports',

    excerpt:
      'Valve được cho là đang chuẩn bị một bản cập nhật lớn dành cho Counter-Strike 2.',

    author:
      'Tuấn Anh',

    date:
      '10/10/2026',

    readTime:
      '4 phút đọc',

    image:
      'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1000&q=80',

    hot:
      true,

    content: [

      'CS2',

      'Counter Strike 2',

      'Valve',

      'FPS',

      'esports',

    ],

  },


  {

    id: 12,

    title:
      'Elden Ring tiếp tục được cộng đồng khám phá những bí mật mới',

    category:
      'PC & Console',

    excerpt:
      'Cộng đồng Elden Ring vẫn đang tìm ra nhiều bí mật thú vị trong thế giới game.',

    author:
      'Quốc Huy',

    date:
      '09/10/2026',

    readTime:
      '7 phút đọc',

    image:
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=80',

    content: [

      'Elden Ring',

      'FromSoftware',

      'Dark Souls',

      'RPG',

    ],

  },


  {

    id: 13,

    title:
      'Free Fire cập nhật phiên bản mới với nhiều tính năng',

    category:
      'Mobile',

    excerpt:
      'Phiên bản mới của Free Fire mang đến nhiều thay đổi đáng chú ý.',

    author:
      'Đức Anh',

    date:
      '08/10/2026',

    readTime:
      '3 phút đọc',

    image:
      'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?auto=format&fit=crop&w=1000&q=80',

    content: [

      'Free Fire',

      'Garena',

      'mobile',

      'battle royale',

    ],

  },

];




const TRENDING: Article[] = [

  ALL_NEWS[0],

  ALL_NEWS[2],

  ALL_NEWS[3],

  ALL_NEWS[6],

  ALL_NEWS[9],

];


@Component({

  selector:
    'app-search',

  standalone:
    true,

  imports: [

    RouterLink,

    FormsModule,

  ],

  templateUrl:
    './search-page.html',

  styleUrl:
    './search-page.css',

})
export class Search
  implements OnInit, OnDestroy {


  readonly PER_PAGE = 6;



  readonly allArticles: Article[] = [

    HERO_ARTICLE,

    ...ALL_NEWS,

  ];


  readonly trending = TRENDING;




  query = '';

  draft = '';

  category = 'Tất cả';

  page = 1;




  private readonly destroy$ =
    new Subject<void>();




  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

  ) {}




  ngOnInit(): void {

    this.route.queryParamMap

      .pipe(
        takeUntil(this.destroy$),
      )

      .subscribe(params => {

        const query =
          params
            .get('q')
            ?.trim() ?? '';


        this.query =
          query;


        this.draft =
          query;


        this.category =
          'Tất cả';


        this.page =
          1;

      });

  }




  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }



  normalize(value: string): string {

    return value

      .normalize('NFD')

      .replace(
        /[\u0300-\u036f]/g,
        '',
      )

      .replace(
        /đ/g,
        'd',
      )

      .replace(
        /Đ/g,
        'D',
      )

      .toLowerCase();

  }





  get matchingArticles(): Article[] {

    if (!this.query) {

      return [];

    }


    const keyword =
      this.normalize(
        this.query,
      );


    return this.allArticles.filter(
      article => {

        const searchable = [

          article.title,

          article.category,

          article.excerpt,

          article.author,

          ...(
            Array.isArray(
              article.content,
            )
              ? article.content
              : []
          ),

        ]

          .filter(Boolean)

          .join(' ');


        return this
          .normalize(searchable)
          .includes(keyword);

      },
    );

  }





  get categories(): string[] {

    return [

      'Tất cả',

      ...Array.from(

        new Set(

          this.matchingArticles

            .map(
              article =>
                article.category,
            ),

        ),

      ),

    ];

  }



  get results(): Article[] {

    if (
      this.category === 'Tất cả'
    ) {

      return this.matchingArticles;

    }


    return this.matchingArticles.filter(

      article =>
        article.category ===
        this.category,

    );

  }




  get totalPages(): number {

    return Math.ceil(

      this.results.length /
      this.PER_PAGE,

    );

  }





  get paginatedArticles(): Article[] {

    const start =
      (this.page - 1) *
      this.PER_PAGE;


    const end =
      start + this.PER_PAGE;


    return this.results.slice(
      start,
      end,
    );

  }




  search(): void {

    const keyword =
      this.draft.trim();


    if (!keyword) {

      return;

    }


    this.router.navigate(

      ['/search'],

      {

        queryParams: {

          q: keyword,

        },

      },

    );

  }




  selectCategory(
    nextCategory: string,
  ): void {

    this.category =
      nextCategory;


    this.page =
      1;

  }




  goTo(
    nextPage: number,
  ): void {

    if (

      nextPage < 1 ||

      nextPage > this.totalPages

    ) {

      return;

    }


    this.page =
      nextPage;


    window.scrollTo({

      top: 0,

      behavior: 'smooth',

    });

  }




  get paginationPages(): number[] {

    return Array.from(

      {

        length:
          this.totalPages,

      },

      (
        _,
        index,
      ) =>
        index + 1,

    );

  }




  articleUrl(
    article: Article,
  ): string {

    return `/bai-viet/${article.id}`;

  }



  trackArticle(

    index: number,

    article: Article,

  ): number {

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
      this.page === this.totalPages
    );

  }

}
