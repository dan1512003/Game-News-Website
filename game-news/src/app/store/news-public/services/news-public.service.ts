import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { ApiResponse } from '../../../shared/models/common/common';

import {
  PublicNewsDetail,
  PublicNewsListItem,
  PublicNewsListResponse,
  PublicNewsQuery,
  PublicNewsRelatedResponse,
  PublicRelatedNewsItem,
} from '../models/news-public.model';

@Injectable({
  providedIn: 'root',
})
export class NewsPublicService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/news';

  getPublicListing(
    query: PublicNewsQuery = {},
  ): Observable<PublicNewsListResponse<PublicNewsListItem>> {
    return this.api
      .get<ApiResponse<PublicNewsListResponse<PublicNewsListItem>>>(
        `${this.endpoint}/public`,
        this.toParams(query),
      )
      .pipe(map((response) => response.data));
  }

  searchPublicNews(
    query: PublicNewsQuery,
  ): Observable<PublicNewsListResponse<PublicNewsListItem>> {
    return this.api
      .get<ApiResponse<PublicNewsListResponse<PublicNewsListItem>>>(
        `${this.endpoint}/search`,
        this.toParams(query),
      )
      .pipe(map((response) => response.data));
  }

  getTrending(limit = 5): Observable<PublicNewsListItem[]> {
    const params = new HttpParams().set('limit', limit);
    return this.api
      .get<ApiResponse<PublicNewsListItem[]>>(
        `${this.endpoint}/trending`,
        params,
      )
      .pipe(map((response) => response.data));
  }

  getDetail(id: string): Observable<PublicNewsDetail> {
    return this.api
      .get<ApiResponse<PublicNewsDetail>>(
        `${this.endpoint}/public/${encodeURIComponent(id)}`,
      )
      .pipe(map((response) => response.data));
  }

  getRelated(
    id: string,
    page = 1,
    limit = 6,
  ): Observable<PublicNewsRelatedResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.api
      .get<ApiResponse<PublicNewsRelatedResponse>>(
        `${this.endpoint}/public/${encodeURIComponent(id)}/related`,
        params,
      )
      .pipe(map((response) => response.data));
  }

  private toParams(query: PublicNewsQuery): HttpParams {
    let params = new HttpParams();

    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }
    if (query.limit !== undefined) {
      params = params.set('limit', query.limit);
    }
    if (query.q?.trim()) {
      params = params.set('q', query.q.trim());
    }
    if (query.category?.trim()) {
      params = params.set('category', query.category.trim());
    }
    if (query.pageType?.trim()) {
      params = params.set('pageType', query.pageType.trim());
    }
    if (query.minScore !== undefined) {
      params = params.set('minScore', query.minScore);
    }

    return params;
  }
}
