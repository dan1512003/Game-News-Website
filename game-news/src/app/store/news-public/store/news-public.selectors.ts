import { createFeatureSelector, createSelector } from '@ngrx/store';
import { newsPublicFeatureKey } from './news-public.reducer';
import { NewsPublicState } from './news-public.state';

export const selectNewsPublicState =
  createFeatureSelector<NewsPublicState>(newsPublicFeatureKey);

  export const selectBreakingNews = createSelector(
  selectNewsPublicState,
  (state) => state.breakingNews,
);

export const selectBreakingNewsLoading = createSelector(
  selectNewsPublicState,
  (state) => state.breakingNewsLoading,
);
export const selectPublicListing = createSelector(
  selectNewsPublicState,
  (state) => state.listing,
);
export const selectPublicNewsItems = createSelector(
  selectPublicListing,
  (response) => response?.items ?? [],
);
export const selectPublicListingPagination = createSelector(
  selectPublicListing,
  (response) => response
    ? {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }
    : null,
);
export const selectPublicListingLoading = createSelector(
  selectNewsPublicState,
  (state) => state.listingLoading,
);

export const selectPublicSearchResults = createSelector(
  selectNewsPublicState,
  (state) => state.searchResults,
);
export const selectPublicSearchItems = createSelector(
  selectPublicSearchResults,
  (response) => response?.items ?? [],
);
export const selectPublicSearchLoading = createSelector(
  selectNewsPublicState,
  (state) => state.searchLoading,
);

export const selectTrendingNews = createSelector(
  selectNewsPublicState,
  (state) => state.trending,
);
export const selectTrendingNewsLoading = createSelector(
  selectNewsPublicState,
  (state) => state.trendingLoading,
);

export const selectPublicNewsDetail = createSelector(
  selectNewsPublicState,
  (state) => state.selectedNews,
);
export const selectPublicNewsDetailLoading = createSelector(
  selectNewsPublicState,
  (state) => state.detailLoading,
);

export const selectRelatedNewsResponse = createSelector(
  selectNewsPublicState,
  (state) => state.related,
);
export const selectRelatedNews = createSelector(
  selectRelatedNewsResponse,
  (response) => response?.items ?? [],
);
export const selectRelatedNewsLoading = createSelector(
  selectNewsPublicState,
  (state) => state.relatedLoading,
);

export const selectNewsPublicError = createSelector(
  selectNewsPublicState,
  (state) => state.error,
);
