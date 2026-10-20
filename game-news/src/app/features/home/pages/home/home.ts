import {
  Component,
} from '@angular/core';

import {
  RouterLink,
} from '@angular/router';



interface NewsArticle {
  id: number;

  title: string;

  category:
    | 'Esports'
    | 'PC & Console'
    | 'Mobile';

  author: string;

  date: string;

  readTime: string;

  views: string;

  image: string;

  hot: boolean;

  score: number | null;

  excerpt: string;

  content: string[];
}


const ALL_NEWS: NewsArticle[] = [

  {
    id: 1,

    title:
      'Đội tuyển Việt Nam làm nên lịch sử tại SEA Championship 2026',

    category: 'Esports',

    author: 'Minh Khoa',

    date: '17/10/2026',

    readTime: '8 phút',

    views: '312K',

    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80',

    hot: true,

    score: null,

    excerpt:
      'Đội tuyển Việt Nam đã làm nên lịch sử với chiến thắng đầy cảm xúc trong trận chung kết SEA Championship 2026.',

    content: [
      'Đội tuyển Việt Nam đã làm nên lịch sử tại SEA Championship 2026 khi giành chiến thắng 3-2 trong trận chung kết marathon kéo dài gần 4 giờ đồng hồ trước đội tuyển Thái Lan.',
      'Từ ván đấu đầu tiên, cả hai đội đã thể hiện đẳng cấp vượt trội so với phần còn lại của giải đấu.',
      'Bước ngoặt xuất hiện ở ván 4 khi Đức Trung thực hiện một pha clutch huyền thoại.',
    ],
  },


  {
    id: 2,

    title:
      'Game thủ Việt Nam thống trị bảng xếp hạng khu vực Đông Nam Á',

    category: 'PC & Console',

    author: 'Lê Minh',

    date: '16/10/2026',

    readTime: '6 phút',

    views: '184K',

    image:
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1400&q=80',

    hot: true,

    score: 9,

    excerpt:
      'Những game thủ Việt Nam đang liên tục tạo dấu ấn tại các giải đấu quốc tế.',

    content: [
      'Cộng đồng game thủ Việt Nam tiếp tục gây chú ý khi nhiều tuyển thủ lọt vào nhóm dẫn đầu bảng xếp hạng khu vực.',
      'Thành tích này đến từ quá trình luyện tập lâu dài.',
    ],
  },


  {
    id: 3,

    title:
      'Tựa game mobile mới bất ngờ đạt hàng triệu lượt tải',

    category: 'Mobile',

    author: 'Thanh Hà',

    date: '15/10/2026',

    readTime: '5 phút',

    views: '96K',

    image:
      'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=1400&q=80',

    hot: false,

    score: 8,

    excerpt:
      'Một tựa game mobile mới đang tạo nên cơn sốt trong cộng đồng game thủ.',

    content: [
      'Tựa game mobile mới ra mắt đã nhanh chóng vượt qua cột mốc một triệu lượt tải.',
      'Điểm mạnh của trò chơi nằm ở lối chơi đơn giản nhưng có chiều sâu.',
    ],
  },


  {
    id: 4,

    title:
      'Giải đấu esports lớn nhất năm chính thức khởi tranh',

    category: 'Esports',

    author: 'Minh Khoa',

    date: '14/10/2026',

    readTime: '7 phút',

    views: '201K',

    image:
      'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1400&q=80',

    hot: true,

    score: null,

    excerpt:
      'Các đội tuyển hàng đầu đã sẵn sàng cho cuộc chiến lớn nhất mùa giải.',

    content: [
      'Giải đấu esports lớn nhất năm đã chính thức khởi tranh.',
      'Ngay trong ngày thi đấu đầu tiên, khán giả đã được chứng kiến nhiều trận đấu hấp dẫn.',
    ],
  },


  {
    id: 5,

    title:
      'Console thế hệ mới đang thay đổi cách chúng ta chơi game',

    category: 'PC & Console',

    author: 'Lê Minh',

    date: '13/10/2026',

    readTime: '9 phút',

    views: '145K',

    image:
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1400&q=80',

    hot: false,

    score: 9,

    excerpt:
      'Công nghệ mới đang mang đến những thay đổi lớn cho thị trường console.',

    content: [
      'Thế hệ console mới đang mang đến nhiều cải tiến đáng kể.',
      'Các nhà phát triển có thể khai thác phần cứng mạnh hơn.',
    ],
  },


  {
    id: 6,

    title:
      'Cộng đồng mobile gaming Việt Nam tiếp tục tăng trưởng mạnh',

    category: 'Mobile',

    author: 'Thanh Hà',

    date: '12/10/2026',

    readTime: '4 phút',

    views: '87K',

    image:
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1400&q=80',

    hot: false,

    score: null,

    excerpt:
      'Thị trường mobile gaming Việt Nam tiếp tục chứng kiến tốc độ tăng trưởng ấn tượng.',

    content: [
      'Mobile gaming đang ngày càng trở thành một phần quan trọng của thị trường game Việt Nam.',
      'Nhiều nhà phát triển trong nước đang bắt đầu đầu tư nghiêm túc hơn.',
    ],
  },


  {
    id: 7,

    title:
      'Những tuyển thủ trẻ đang tạo nên thế hệ vàng mới',

    category: 'Esports',

    author: 'Hoàng Nam',

    date: '11/10/2026',

    readTime: '6 phút',

    views: '76K',

    image:
      'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1400&q=80',

    hot: false,

    score: 8,

    excerpt:
      'Một thế hệ tuyển thủ trẻ đang dần khẳng định vị thế trên đấu trường quốc tế.',

    content: [
      'Các tuyển thủ trẻ đang nhận được nhiều sự quan tâm.',
      'Nhiều người trong số họ đã bắt đầu thi đấu chuyên nghiệp từ rất sớm.',
    ],
  },


  {
    id: 8,

    title:
      'Top game PC đáng chơi nhất trong tháng 10',

    category: 'PC & Console',

    author: 'Quang Huy',

    date: '10/10/2026',

    readTime: '10 phút',

    views: '63K',

    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80',

    hot: false,

    score: 9,

    excerpt:
      'Danh sách những tựa game PC nổi bật nhất tháng này.',

    content: [
      'Tháng 10 mang đến rất nhiều tựa game hấp dẫn.',
      'Một số trò chơi nổi bật nhờ đồ họa và gameplay.',
    ],
  },


  {
    id: 9,

    title:
      'Game mobile Việt Nam gây chú ý tại thị trường quốc tế',

    category: 'Mobile',

    author: 'Thanh Hà',

    date: '09/10/2026',

    readTime: '5 phút',

    views: '58K',

    image:
      'https://images.unsplash.com/photo-1550747545-c896b5f2d2d3?auto=format&fit=crop&w=1400&q=80',

    hot: true,

    score: 8,

    excerpt:
      'Một studio Việt Nam đang gây chú ý với sản phẩm mobile mới.',

    content: [
      'Sản phẩm mới của studio Việt Nam đang nhận được phản hồi tích cực.',
    ],
  },


  {
    id: 10,

    title:
      'Công nghệ ray tracing đang thay đổi đồ họa game',

    category: 'PC & Console',

    author: 'Lê Minh',

    date: '08/10/2026',

    readTime: '7 phút',

    views: '51K',

    image:
      'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1400&q=80',

    hot: false,

    score: 9,

    excerpt:
      'Ray tracing đang trở thành công nghệ quan trọng trong đồ họa game hiện đại.',

    content: [
      'Ray tracing mang lại khả năng mô phỏng ánh sáng chân thực hơn.',
    ],
  },


  {
    id: 11,

    title:
      'Esports Việt Nam chuẩn bị cho mùa giải quốc tế mới',

    category: 'Esports',

    author: 'Minh Khoa',

    date: '07/10/2026',

    readTime: '6 phút',

    views: '49K',

    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80',

    hot: false,

    score: null,

    excerpt:
      'Các đội tuyển Việt Nam đang tích cực chuẩn bị cho mùa giải mới.',

    content: [
      'Các đội tuyển đang bước vào giai đoạn luyện tập quan trọng.',
    ],
  },


  {
    id: 12,

    title:
      'Những phụ kiện gaming đáng mua trong năm 2026',

    category: 'PC & Console',

    author: 'Quang Huy',

    date: '06/10/2026',

    readTime: '8 phút',

    views: '44K',

    image:
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1400&q=80',

    hot: false,

    score: 8,

    excerpt:
      'Danh sách những phụ kiện gaming đáng chú ý nhất năm.',

    content: [
      'Các thiết bị gaming ngày càng đa dạng và hiện đại.',
    ],
  },
];

const HERO_ARTICLE: NewsArticle =
  ALL_NEWS[0];

const SECONDARY_FEATURED: NewsArticle[] = [
  ALL_NEWS[1],
  ALL_NEWS[2],
];


const TRENDING: NewsArticle[] = [
  ALL_NEWS[0],
  ALL_NEWS[3],
  ALL_NEWS[1],
  ALL_NEWS[8],
  ALL_NEWS[7],
];

@Component({
  selector: 'app-home',

  standalone: true,

  imports: [
    RouterLink,
  ],

  templateUrl: './home.html',

  styleUrl: './home.css',
})
export class Home {


  readonly heroArticle =
    HERO_ARTICLE;

  readonly secondaryFeatured =
    SECONDARY_FEATURED;

  readonly trending =
    TRENDING;

  readonly allNews =
    ALL_NEWS;


  readonly PER_PAGE = 6;

  page = 1;


  get totalPages(): number {

    return Math.ceil(
      this.allNews.length /
      this.PER_PAGE
    );
  }


  get news(): NewsArticle[] {

    const start =
      (this.page - 1) *
      this.PER_PAGE;

    const end =
      start +
      this.PER_PAGE;

    return this.allNews.slice(
      start,
      end
    );
  }


  get paginationPages(): number[] {

    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index + 1
    );
  }



  // PAGINATION


  goTo(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }


  previousPage(): void {

    this.goTo(
      this.page - 1
    );
  }


  nextPage(): void {

    this.goTo(
      this.page + 1
    );
  }






  getCategoryUrl(
    category: string
  ): string {

    switch (category) {

      case 'PC & Console':
        return '/pc-console';

      case 'Mobile':
        return '/mobile';

      case 'Esports':
        return '/esports';

      default:
        return '/';
    }
  }


 

  getToday(): string {

    return new Date()
      .toLocaleDateString(
        'vi-VN',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      );
  }
}