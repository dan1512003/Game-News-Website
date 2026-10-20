import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import {
  FormsModule,
} from '@angular/forms';


interface Article {
  id: number;
  title: string;
  category: string;
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


interface Comment {
  id: number;

  name: string;

  content: string;

  time: string;

  likes: number;

  liked: boolean;

  avatarColor: string;

  parentId: number | null;
  rootId: number;
}


@Component({
  selector: 'app-news-detail',
  standalone: true,

  imports: [
    RouterLink,
    FormsModule,
  ],

  templateUrl: './news-detail.html',

  styleUrl: './news-detail.css',
})
export class NewsDetail implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);



  readonly COMMENT_PREVIEW_LENGTH = 180;

  readonly COLLAPSED_THREAD_SIZE = 3;

  readonly AVATAR_COLORS = [
    '#ff5c00',
    '#3b82f6',
    '#16a34a',
    '#7c3aed',
    '#dc2626',
    '#f59e0b',
    '#0891b2',
  ];


  // =========================================================
  // ARTICLES
  // =========================================================

  readonly articles: Article[] = [

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

        'Từ ván đấu đầu tiên, cả hai đội đã thể hiện đẳng cấp vượt trội so với phần còn lại của giải đấu. Việt Nam thắng ván 1 với tỷ số 13-6, nhưng Thái Lan lập tức phản công và giành lại thế cân bằng ở ván 2 và 3.',

        'Bước ngoặt xuất hiện ở ván 4 khi Đức Trung — main carry của đội tuyển Việt Nam — thực hiện một pha clutch huyền thoại trong round 29 đang ở thế 1 chống 4.',

        '"Tôi không nghĩ nhiều, chỉ nghĩ đến việc phải tin tưởng vào bản thân và những gì chúng tôi đã tập luyện," Đức Trung chia sẻ sau trận đấu với đôi mắt đỏ hoe.',

        'Ván 5 là màn trình diễn tập thể hoàn hảo. Cả 5 thành viên đội tuyển Việt Nam đều xuất hiện trong những khoảnh khắc quyết định.',

        'Đây là lần thứ 2 Việt Nam vô địch SEA Championship, nhưng khó khăn hơn và đáng nhớ hơn lần đầu tiên năm 2023.',
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

        'Thành tích này đến từ quá trình luyện tập lâu dài và sự đầu tư ngày càng chuyên nghiệp của các đội tuyển.',

        'Các chuyên gia nhận định Việt Nam đang trở thành một trong những khu vực esports đáng chú ý nhất Đông Nam Á.',

        'Nhiều đội tuyển đang chuẩn bị cho mùa giải quốc tế tiếp theo.',
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
        'Tựa game mobile mới ra mắt đã nhanh chóng vượt qua cột mốc một triệu lượt tải chỉ sau vài ngày.',

        'Điểm mạnh của trò chơi nằm ở lối chơi đơn giản nhưng có chiều sâu.',

        'Nhà phát triển cho biết họ sẽ tiếp tục bổ sung nội dung mới trong các bản cập nhật tiếp theo.',
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
        'Giải đấu esports lớn nhất năm đã chính thức khởi tranh với sự góp mặt của những đội tuyển mạnh nhất.',

        'Ngay trong ngày thi đấu đầu tiên, khán giả đã được chứng kiến nhiều trận đấu hấp dẫn.',

        'Các đội tuyển Việt Nam được kỳ vọng sẽ tạo nên bất ngờ tại giải đấu lần này.',
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
        'Thế hệ console mới đang mang đến nhiều cải tiến đáng kể về hiệu năng và trải nghiệm người dùng.',

        'Các nhà phát triển có thể khai thác phần cứng mạnh hơn để tạo ra thế giới game chi tiết hơn.',

        'Điều này cũng mở ra nhiều cơ hội mới cho các nhà phát triển game độc lập.',
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

        'Nhiều nhà phát triển trong nước đang bắt đầu đầu tư nghiêm túc hơn vào nền tảng mobile.',

        'Xu hướng này được dự đoán sẽ tiếp tục tăng trưởng trong những năm tới.',
      ],
    },
  ];



  article: Article | null = null;




  comments: Comment[] = [



    {
      id: 1,

      name: 'Phong Nguyễn',

      content:
        'Bài viết rất hay và chi tiết! Đội tuyển VN xứng đáng được công nhận sau bao nỗ lực. Hành trình từ vòng bảng đến chung kết thực sự rất cảm xúc.',

      time: '2 giờ trước',

      likes: 24,

      liked: false,

      avatarColor: '#ff5c00',

      parentId: null,

      rootId: 1,
    },



    {
      id: 101,

      name: 'Minh Khoa (Tác giả)',

      content:
        'Cảm ơn bạn đã đọc! Mình cũng rất xúc động khi tường thuật trực tiếp trận đó. Một kỳ tích thực sự!',

      time: '1 giờ trước',

      likes: 8,

      liked: false,

      avatarColor: '#ff5c00',

      parentId: 1,

      rootId: 1,
    },



    {
      id: 2,

      name: 'Lan Anh',

      content:
        'Trận chung kết hôm đó mình thức đến 2h sáng xem. Căng thẳng đến mức tim gần như đứng lại ở hiệp phụ. Tự hào lắm!',

      time: '3 giờ trước',

      likes: 18,

      liked: false,

      avatarColor: '#3b82f6',

      parentId: null,

      rootId: 2,
    },



    {
      id: 3,

      name: 'Đức Minh',

      content:
        'Phần phân tích chiến thuật ở đây rất sâu sắc. Cái cách team mình read lane trong map 5 thực sự là đỉnh của esports Đông Nam Á. Cho mình hỏi nguồn dữ liệu thống kê từ đâu vậy tác giả?',

      time: '5 giờ trước',

      likes: 12,

      liked: false,

      avatarColor: '#16a34a',

      parentId: null,

      rootId: 3,
    },




    {
      id: 301,

      name: 'Minh Khoa (Tác giả)',

      content:
        'Nguồn dữ liệu mình tổng hợp từ hệ thống thống kê của giải đấu và dữ liệu thi đấu trực tiếp.',

      time: '4 giờ trước',

      likes: 5,

      liked: false,

      avatarColor: '#ff5c00',

      parentId: 3,

      rootId: 3,
    },




    {
      id: 302,

      name: 'Thanh Hằng',

      content:
        'Mình cũng rất thích phần phân tích này. Hy vọng tác giả sẽ có thêm bài phân tích chuyên sâu.',

      time: '3 giờ trước',

      likes: 4,

      liked: false,

      avatarColor: '#7c3aed',

      parentId: 3,

      rootId: 3,
    },




    {
      id: 303,

      name: 'Phong Nguyễn',

      content:
        'Mình cũng rất quan tâm đến phần dữ liệu này. Cảm ơn tác giả đã chia sẻ.',

      time: '2 giờ trước',

      likes: 2,

      liked: false,

      avatarColor: '#ff5c00',

      parentId: 301,

      rootId: 3,
    },



    {
      id: 4,

      name: 'Thanh Hằng',

      content:
        'Ủng hộ GameZone vì những bài viết chất lượng như này. Hãy tiếp tục ra những nội dung tốt nhé 🔥',

      time: '6 giờ trước',

      likes: 9,

      liked: false,

      avatarColor: '#7c3aed',

      parentId: null,

      rootId: 4,
    },
  ];




  newName = '';

  newComment = '';

  sortBy: 'newest' | 'popular' = 'newest';


  

  expandedComments: Record<number, boolean> = {};

  replyOpen: Record<number, boolean> = {};

  replyNames: Record<number, string> = {};

  replyTexts: Record<number, string> = {};

  expandedReplies: Record<number, boolean> = {};



  ngOnInit(): void {

    const idParam =
      this.route.snapshot.paramMap.get('id');


    console.log(
      '[NewsDetail] URL:',
      this.router.url
    );


    console.log(
      '[NewsDetail] id:',
      idParam
    );


    if (!idParam) {

      console.error(
        '[NewsDetail] Không tìm thấy id trên URL'
      );

      this.article = null;

      return;
    }


    const articleId =
      Number(idParam);


    if (Number.isNaN(articleId)) {

      console.error(
        '[NewsDetail] ID không hợp lệ:',
        idParam
      );

      this.article = null;

      return;
    }


    this.article =
      this.articles.find(
        item => item.id === articleId
      ) ?? null;


    console.log(
      '[NewsDetail] Article:',
      this.article
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




  getAvatarLetter(
    name: string | undefined
  ): string {

    if (!name) {
      return 'A';
    }


    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  }




  share(type: string): void {

    if (!this.article) {
      return;
    }


    if (type === 'Copy') {

      navigator.clipboard
        ?.writeText(window.location.href);

      return;
    }


    if (type === 'Twitter') {

      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(this.article.title)}`,
        '_blank'
      );

      return;
    }


    if (type === 'Facebook') {

      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
        '_blank'
      );
    }
  }



  get sortedComments(): Comment[] {

    const roots =
      this.comments.filter(
        comment =>
          comment.parentId === null
      );


    return [...roots].sort(
      (a, b) => {

        if (this.sortBy === 'popular') {

          return b.likes - a.likes;
        }


        return b.id - a.id;
      }
    );
  }



  getReplies(
    rootId: number
  ): Comment[] {

    return this.comments
      .filter(
        comment =>
          comment.rootId === rootId &&
          comment.parentId !== null
      )
      .sort(
        (a, b) =>
          a.id - b.id
      );
  }




  getDirectReplies(
    parentId: number
  ): Comment[] {

    return this.comments
      .filter(
        comment =>
          comment.parentId === parentId
      )
      .sort(
        (a, b) =>
          a.id - b.id
      );
  }




  findComment(
    id: number
  ): Comment | undefined {

    return this.comments.find(
      comment =>
        comment.id === id
    );
  }


  submitComment(): void {

    const name =
      this.newName?.trim();

    const content =
      this.newComment?.trim();


    if (!name || !content) {
      return;
    }


    const id =
      Date.now();


    const comment: Comment = {

      id,

      name,

      content,

      time: 'Vừa xong',

      likes: 0,

      liked: false,

      avatarColor:
        this.getRandomAvatarColor(),

      parentId: null,

      rootId: id,
    };


    this.comments = [
      comment,
      ...this.comments,
    ];


    this.newName = '';

    this.newComment = '';
  }




  likeComment(
    id: number
  ): void {

    this.comments =
      this.comments.map(
        comment => {

          if (
            comment.id !== id
          ) {
            return comment;
          }


          const liked =
            !comment.liked;


          return {

            ...comment,

            liked,

            likes:
              liked
                ? comment.likes + 1
                : Math.max(
                    0,
                    comment.likes - 1
                  ),
          };
        }
      );
  }




  toggleReply(
    id: number
  ): void {

    this.replyOpen[id] =
      !this.replyOpen[id];
  }




  submitReply(
    parent: Comment
  ): void {

    const name =
      this.replyNames[parent.id]
        ?.trim();


    const content =
      this.replyTexts[parent.id]
        ?.trim();


    if (!name || !content) {
      return;
    }


    const id =
      Date.now();



    const reply: Comment = {

      id,

      name,

      content,

      time: 'Vừa xong',

      likes: 0,

      liked: false,

      avatarColor:
        this.getRandomAvatarColor(),

      parentId:
        parent.id,

      rootId:
        parent.rootId,
    };


    this.comments = [
      ...this.comments,
      reply,
    ];


    this.replyNames[parent.id] =
      '';

    this.replyTexts[parent.id] =
      '';

    this.replyOpen[parent.id] =
      false;


    this.expandedReplies[
      parent.rootId
    ] = true;
  }




  shouldShowReplyMention(
    comment: Comment
  ): boolean {


    return (
      comment.parentId !== null &&
      comment.parentId !== comment.rootId
    );
  }




  getParentName(
    comment: Comment
  ): string {

    if (
      comment.parentId === null
    ) {
      return '';
    }


    const parent =
      this.findComment(
        comment.parentId
      );


    return parent?.name ?? '';
  }



  isLongComment(
    comment: Comment
  ): boolean {

    return (
      (comment.content ?? '').length >
      this.COMMENT_PREVIEW_LENGTH
    );
  }


  getVisibleCommentContent(
    comment: Comment
  ): string {

    const content =
      comment.content ?? '';


    if (
      !this.isLongComment(comment) ||
      this.expandedComments[comment.id]
    ) {

      return content;
    }


    return (
      content
        .slice(
          0,
          this.COMMENT_PREVIEW_LENGTH
        )
        .trimEnd() +
      '…'
    );
  }


  toggleCommentContent(
    id: number
  ): void {

    this.expandedComments[id] =
      !this.expandedComments[id];
  }




  countReplies(
    comment: Comment
  ): number {

    return this.comments.filter(
      item =>
        item.rootId === comment.rootId &&
        item.parentId !== null
    ).length;
  }




  shouldCollapseReplies(
    comment: Comment
  ): boolean {

    return (
      this.countReplies(comment) >=
      this.COLLAPSED_THREAD_SIZE
    );
  }


  shouldShowReplies(
    comment: Comment
  ): boolean {

    const count =
      this.countReplies(comment);


    if (
      count <
      this.COLLAPSED_THREAD_SIZE
    ) {

      return true;
    }


    return !!this.expandedReplies[
      comment.rootId
    ];
  }


  toggleReplies(
    rootId: number
  ): void {

    this.expandedReplies[rootId] =
      !this.expandedReplies[rootId];
  }




  getRelatedArticles(): Article[] {

    if (!this.article) {
      return [];
    }


    return this.articles
      .filter(
        item =>
          item.id !== this.article!.id &&
          item.category === this.article!.category
      )
      .slice(0, 4);
  }



  getAuthorArticles(): Article[] {

    if (!this.article) {
      return [];
    }


    return this.articles
      .filter(
        item =>
          item.author === this.article!.author &&
          item.id !== this.article!.id
      )
      .slice(0, 3);
  }




  private getRandomAvatarColor(): string {

    const index =
      Math.floor(
        Math.random() *
        this.AVATAR_COLORS.length
      );


    return (
      this.AVATAR_COLORS[index] ??
      this.AVATAR_COLORS[0]
    );
  }
}