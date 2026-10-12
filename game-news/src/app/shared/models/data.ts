export type User = {
  user_id: number
  username: string
  email: string
  role: string
  created_at: string
  status: string
}

export const MOCK_USERS: User[] = [
  {
    user_id: 1,
    username: 'admin',
    email: 'admin@gamezone.vn',
    role: 'admin',
    created_at: '2026-01-01',
    status: 'active',
  },
  {
    user_id: 2,
    username: 'minhkhoa',
    email: 'minhkhoa@gamezone.vn',
    role: 'editor',
    created_at: '2026-02-10',
    status: 'active',
  },
  {
    user_id: 3,
    username: 'tuananh',
    email: 'tuananh@gamezone.vn',
    role: 'editor',
    created_at: '2026-02-15',
    status: 'active',
  },
  {
    user_id: 4,
    username: 'hailong',
    email: 'hailong@gamezone.vn',
    role: 'editor',
    created_at: '2026-03-01',
    status: 'active',
  },
  {
    user_id: 5,
    username: 'nguyenphuong',
    email: 'phuong@gmail.com',
    role: 'user',
    created_at: '2026-03-10',
    status: 'active',
  },
  {
    user_id: 6,
    username: 'lananh2026',
    email: 'lananh@gmail.com',
    role: 'user',
    created_at: '2026-04-01',
    status: 'active',
  },
  {
    user_id: 7,
    username: 'ducminh99',
    email: 'ducminh@yahoo.com',
    role: 'user',
    created_at: '2026-04-15',
    status: 'banned',
  },
  {
    user_id: 8,
    username: 'quynhanh',
    email: 'quynhanh@gamezone.vn',
    role: 'editor',
    created_at: '2026-05-01',
    status: 'active',
  },
]

export type Category = {
  category_id: number
  name: string
  description: string
  news_count: number
}

export const MOCK_CATEGORIES: Category[] = [
  {
    category_id: 1,
    name: 'PC Gaming',
    description: 'Tin tức về game PC và phần cứng',
    news_count: 48,
  },
  {
    category_id: 2,
    name: 'Console',
    description: 'PlayStation, Xbox, Nintendo',
    news_count: 35,
  },
  {
    category_id: 3,
    name: 'Mobile',
    description: 'Game di động iOS & Android',
    news_count: 29,
  },
  {
    category_id: 4,
    name: 'Esports',
    description: 'Tin tức thi đấu chuyên nghiệp',
    news_count: 64,
  },
  {
    category_id: 5,
    name: 'Đánh giá',
    description: 'Review game chuyên sâu',
    news_count: 22,
  },
  {
    category_id: 6,
    name: 'Tin nhanh',
    description: 'Cập nhật nhanh từ làng game',
    news_count: 87,
  },
]

export type Game = {
  game_id: number
  name: string
  developer: string
  publisher: string
  platform: string
  release_date: string
  type_id: number
  status: string
}

export const MOCK_GAMES: Game[] = [
  {
    game_id: 1,
    name: 'GTA VI',
    developer: 'Rockstar North',
    publisher: 'Rockstar Games',
    platform: 'PC, PS5, Xbox',
    release_date: '2026-10-02',
    type_id: 8,
    status: 'released',
  },
  {
    game_id: 2,
    name: 'Elden Ring: Shadow of the Erdtree',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    platform: 'PC, PS5, Xbox',
    release_date: '2026-06-21',
    type_id: 1,
    status: 'released',
  },
  {
    game_id: 3,
    name: 'Counter-Strike 2',
    developer: 'Valve',
    publisher: 'Valve',
    platform: 'PC',
    release_date: '2023-09-27',
    type_id: 2,
    status: 'released',
  },
  {
    game_id: 4,
    name: 'Valorant',
    developer: 'Riot Games',
    publisher: 'Riot Games',
    platform: 'PC, Mobile',
    release_date: '2020-06-02',
    type_id: 2,
    status: 'released',
  },
  {
    game_id: 5,
    name: 'League of Legends',
    developer: 'Riot Games',
    publisher: 'Riot Games',
    platform: 'PC',
    release_date: '2009-10-27',
    type_id: 3,
    status: 'released',
  },
  {
    game_id: 6,
    name: 'PUBG Mobile',
    developer: 'LightSpeed Studios',
    publisher: 'Tencent',
    platform: 'Mobile',
    release_date: '2018-03-19',
    type_id: 4,
    status: 'released',
  },
]

export type NewsItem = {
  news_id: number
  title: string
  category_id: number
  game_id: number
  author: string
  thumbnail: string
  published_at: string
  status: string
  views: number
  game_name?: string
  platform_name?: string
  source_name?: string
  source_url?: string
  article_type?: string
  slug?: string
  seo_description?: string
  editor_note?: string
}

export const MOCK_NEWS: NewsItem[] = [
  {
    news_id: 1,
    title: 'Vietnam Esports Vô Địch SEA Championship 2026',
    category_id: 4,
    game_id: 5,
    author: 'Minh Khoa',
    thumbnail:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&h=50&fit=crop',
    published_at: '2026-09-25',
    status: 'published',
    views: 312000,
  },
  {
    news_id: 2,
    title: 'GTA VI Tung Trailer Cuối Trước Ngày Ra Mắt',
    category_id: 1,
    game_id: 1,
    author: 'Tuấn Anh',
    thumbnail:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=80&h=50&fit=crop',
    published_at: '2026-09-25',
    status: 'published',
    views: 189000,
  },
  {
    news_id: 3,
    title: 'PlayStation 6 Lộ Thông Số Kỹ Thuật Chính Thức',
    category_id: 2,
    game_id: 0,
    author: 'Quỳnh Anh',
    thumbnail:
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=80&h=50&fit=crop',
    published_at: '2026-09-24',
    status: 'published',
    views: 145000,
  },
  {
    news_id: 4,
    title: 'Review Elden Ring: Shadow of the Erdtree DLC',
    category_id: 5,
    game_id: 2,
    author: 'Tuấn Anh',
    thumbnail:
      'https://images.unsplash.com/photo-1519326844852-704caea5679e?w=80&h=50&fit=crop',
    published_at: '2026-09-24',
    status: 'published',
    views: 89000,
  },
  {
    news_id: 5,
    title: 'T1 Faker Tuyên Bố Giải Nghệ Sau 15 Năm',
    category_id: 4,
    game_id: 5,
    author: 'Hải Long',
    thumbnail:
      'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=80&h=50&fit=crop',
    published_at: '2026-09-24',
    status: 'published',
    views: 312000,
  },
  {
    news_id: 6,
    title: 'PUBG Mobile 4.0 Ra Mắt Map Titan Valley',
    category_id: 3,
    game_id: 6,
    author: 'Thu Hà',
    thumbnail:
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=80&h=50&fit=crop',
    published_at: '2026-09-23',
    status: 'published',
    views: 142000,
  },
]
