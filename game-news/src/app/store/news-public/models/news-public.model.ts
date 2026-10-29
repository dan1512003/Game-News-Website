export interface PublicNewsCategory {
  name: string;
}

export interface PublicNewsAuthor {
  id?: string;
  username: string;
}

export interface PublicNewsTag {
  id: string;
  name: string;
}

export interface PublicNewsListItem {
  newsId: string;
  title: string;
  slug: string;
  summary: string;
  category: PublicNewsCategory | null;
  author: PublicNewsAuthor | null;
  publishedAt: Date | string | null;
  thumbnail: string;
  views: string | number;
  reviewScore: number | null;
}

export interface PublicNewsDetail {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  thumbnail: string | null;
  status: string;
  views: number;
  reviewScore: number | null;
  publishedAt: Date | string | null;
  author: PublicNewsAuthor | null;
  category: (PublicNewsCategory & { id: string }) | null;
  tags: PublicNewsTag[];
  contentBlocks: PublicNewsContentBlock[];
}

export interface PublicNewsContentBlock {
  id: string;
  type: string;
  content: string;
  position: number;
}

export interface PublicRelatedNewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  thumbnail: string | null;
  publishedAt: Date | string | null;
  author: PublicNewsAuthor | null;
  category: (PublicNewsCategory & { id: string }) | null;
  tags: PublicNewsTag[];
}

export interface PublicNewsQuery {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  pageType?: string;
  minScore?: number;
}

export interface PublicNewsListResponse<T = PublicNewsListItem> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categories?: string[];
}

export interface PublicNewsRelatedResponse {
  items: PublicRelatedNewsItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
