
import { createAction, props } from '@ngrx/store';



import {
  PublicNewsDetail,
  PublicNewsListItem,
  PublicNewsListResponse,
  PublicNewsQuery,
  PublicNewsRelatedResponse,
} from '../models/news-public.model';
import { ApiErrorResponse } from '../../../shared/models/auth/auth.model';

// Breaking News
export const loadBreakingNews = createAction(
  '[News Public] Load Breaking News',
);

export const loadBreakingNewsSuccess = createAction(
  '[News Public] Load Breaking News Success',
  props<{ items: PublicNewsListItem[] }>(),
);

export const loadBreakingNewsFailure = createAction(
  '[News Public] Load Breaking News Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Listing
export const loadPublicListing = createAction(
  '[News Public] Load Listing',
  props<{ query: PublicNewsQuery }>(),
);

export const loadPublicListingSuccess = createAction(
  '[News Public] Load Listing Success',
  props<{
    response: PublicNewsListResponse<PublicNewsListItem>;
  }>(),
);

export const loadPublicListingFailure = createAction(
  '[News Public] Load Listing Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Search
export const searchPublicNews = createAction(
  '[News Public] Search',
  props<{ query: PublicNewsQuery }>(),
);

export const searchPublicNewsSuccess = createAction(
  '[News Public] Search Success',
  props<{
    response: PublicNewsListResponse<PublicNewsListItem>;
  }>(),
);

export const searchPublicNewsFailure = createAction(
  '[News Public] Search Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Trending
export const loadTrendingNews = createAction(
  '[News Public] Load Trending',
  props<{ limit?: number }>(),
);

export const loadTrendingNewsSuccess = createAction(
  '[News Public] Load Trending Success',
  props<{ items: PublicNewsListItem[] }>(),
);

export const loadTrendingNewsFailure = createAction(
  '[News Public] Load Trending Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Detail
export const loadPublicNewsDetail = createAction(
  '[News Public] Load Detail',
  props<{ id: string }>(),
);

export const loadPublicNewsDetailSuccess = createAction(
  '[News Public] Load Detail Success',
  props<{ item: PublicNewsDetail }>(),
);

export const loadPublicNewsDetailFailure = createAction(
  '[News Public] Load Detail Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Related
export const loadRelatedNews = createAction(
  '[News Public] Load Related',
  props<{ id: string; page?: number; limit?: number }>(),
);

export const loadRelatedNewsSuccess = createAction(
  '[News Public] Load Related Success',
  props<{ response: PublicNewsRelatedResponse }>(),
);

export const loadRelatedNewsFailure = createAction(
  '[News Public] Load Related Failure',
  props<{ error: ApiErrorResponse }>(),
);

// Clear
export const clearPublicNewsDetail = createAction(
  '[News Public] Clear Detail',
);
