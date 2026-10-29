import { createReducer, on } from '@ngrx/store';
import * as Actions from './news-public.actions';
import { NewsPublicState, initialNewsPublicState } from './news-public.state';

export const newsPublicFeatureKey = 'newsPublic';

export const newsPublicReducer = createReducer(
  initialNewsPublicState,
on(Actions.loadBreakingNews, (state) => ({
  ...state,
  breakingNewsLoading: true,
})),

on(Actions.loadBreakingNewsSuccess, (state, { items }) => ({
  ...state,
  breakingNews: items,
  breakingNewsLoading: false,
})),

on(Actions.loadBreakingNewsFailure, (state, { error }) => ({
  ...state,
  breakingNewsLoading: false,
  error,
})),
  on(Actions.loadPublicListing, (state) => ({
    ...state,
    listingLoading: true,
    error: null,
  })),
  on(Actions.loadPublicListingSuccess, (state, { response }) => ({
    ...state,
    listing: response,
    listingLoading: false,
  })),
  on(Actions.loadPublicListingFailure, (state, { error }) => ({
    ...state,
    listingLoading: false,
    error,
  })),

  on(Actions.searchPublicNews, (state) => ({
    ...state,
    searchLoading: true,
    error: null,
  })),
  on(Actions.searchPublicNewsSuccess, (state, { response }) => ({
    ...state,
    searchResults: response,
    searchLoading: false,
  })),
  on(Actions.searchPublicNewsFailure, (state, { error }) => ({
    ...state,
    searchLoading: false,
    error,
  })),

  on(Actions.loadTrendingNews, (state) => ({
    ...state,
    trendingLoading: true,
    error: null,
  })),
  on(Actions.loadTrendingNewsSuccess, (state, { items }) => ({
    ...state,
    trending: items,
    trendingLoading: false,
  })),
  on(Actions.loadTrendingNewsFailure, (state, { error }) => ({
    ...state,
    trendingLoading: false,
    error,
  })),

  on(Actions.loadPublicNewsDetail, (state) => ({
    ...state,
    detailLoading: true,
    selectedNews: null,
    error: null,
  })),
  on(Actions.loadPublicNewsDetailSuccess, (state, { item }) => ({
    ...state,
    selectedNews: item,
    detailLoading: false,
  })),
  on(Actions.loadPublicNewsDetailFailure, (state, { error }) => ({
    ...state,
    detailLoading: false,
    error,
  })),

  on(Actions.loadRelatedNews, (state) => ({
    ...state,
    relatedLoading: true,
    error: null,
  })),
  on(Actions.loadRelatedNewsSuccess, (state, { response }) => ({
    ...state,
    related: response,
    relatedLoading: false,
  })),
  on(Actions.loadRelatedNewsFailure, (state, { error }) => ({
    ...state,
    relatedLoading: false,
    error,
  })),

  on(Actions.clearPublicNewsDetail, (state) => ({
    ...state,
    selectedNews: null,
    related: null,
  })),
);
