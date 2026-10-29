import {
  PublicNewsDetail,
  PublicNewsListItem,
  PublicNewsListResponse,
  PublicNewsRelatedResponse,
} from '../models/news-public.model';

export interface NewsPublicState {
  breakingNews: PublicNewsListItem[];
breakingNewsLoading: boolean;
  listing: PublicNewsListResponse<PublicNewsListItem> | null;
  searchResults: PublicNewsListResponse<PublicNewsListItem> | null;
  trending: PublicNewsListItem[];
  selectedNews: PublicNewsDetail | null;
  related: PublicNewsRelatedResponse | null;
  listingLoading: boolean;
  searchLoading: boolean;
  trendingLoading: boolean;
  detailLoading: boolean;
  relatedLoading: boolean;
  error: string | null;
}

export const initialNewsPublicState: NewsPublicState = {
  breakingNews: [],
breakingNewsLoading: false,
  listing: null,
  searchResults: null,
  trending: [],
  selectedNews: null,
  related: null,
  listingLoading: false,
  searchLoading: false,
  trendingLoading: false,
  detailLoading: false,
  relatedLoading: false,
  error: null,
};
