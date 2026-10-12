import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { ApiResponse } from '../../../shared/models/auth/auth.model';

import {

  CommentDashboardStats,
  CommentDetail,
  CommentListResponse,
  CommentParentDetail,
  CommentQuery,
  CommentStatusResponse,
  DeleteCommentResponse,
} from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/comments';

  // GET /comments?page=1&limit=10&search=...
 getAll(
  query: CommentQuery = {},
): Observable<CommentListResponse> {
  let params = new HttpParams()
    .set('page', query.page ?? 1)
    .set('limit', query.limit ?? 10);

  if (query.search?.trim()) {
    params = params.set('search', query.search.trim());
  }

  if (query.status) {
    params = params.set('status', query.status);
  }

  if (query.newsId) {
    params = params.set('newsId', query.newsId);
  }

  if (query.userId) {
    params = params.set('userId', query.userId);
  }

  return this.api
    .get<ApiResponse<CommentListResponse>>(
      this.endpoint,
      params,
    )
    .pipe(map((response) => response.data));
}
  // GET /comments/:id
  getById(id: string): Observable<CommentDetail> {
    return this.api
      .get<ApiResponse<CommentDetail>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(map((response) => response.data));
  }

  // GET /comments/:id/parent
  getParent(
    id: string,
  ): Observable<CommentParentDetail | null> {
    return this.api
      .get<ApiResponse<CommentParentDetail | null>>(
        `${this.endpoint}/${id}/parent`,
      )
      .pipe(map((response) => response.data));
  }

  // PATCH /comments/:id/approve
  approve(id: string): Observable<CommentStatusResponse> {
    return this.api
      .patch<ApiResponse<CommentStatusResponse>>(
        `${this.endpoint}/${id}/approve`,
        {},
      )
      .pipe(map((response) => response.data));
  }

  // PATCH /comments/:id/reject
  reject(id: string): Observable<CommentStatusResponse> {
    return this.api
      .patch<ApiResponse<CommentStatusResponse>>(
        `${this.endpoint}/${id}/reject`,
        {},
      )
      .pipe(map((response) => response.data));
  }

  // DELETE /comments/:id
  delete(id: string): Observable<DeleteCommentResponse> {
    return this.api
      .delete<ApiResponse<DeleteCommentResponse>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(map((response) => response.data));
  }
  // GET /comments/dashboard-stats
getDashboardStats(): Observable<CommentDashboardStats> {
  return this.api
    .get<ApiResponse<CommentDashboardStats>>(
      `${this.endpoint}/dashboard-stats`,
    )
    .pipe(map((response) => response.data));
}
}