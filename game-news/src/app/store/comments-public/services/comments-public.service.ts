import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { ApiResponse } from '../../../shared/models/common/common';

import {
  CommentSort,
  CreateCommentDto,
  CreateCommentResponse,
  PublicComment,
  ToggleCommentLikeResponse,
} from '../models/comments-public.model';

@Injectable({
  providedIn: 'root',
})
export class CommentsPublicService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/comments';

  findByNews(
    newsId: string,
    sortBy: CommentSort = 'newest',
  ): Observable<PublicComment[]> {
    const params = new HttpParams().set('sortBy', sortBy);
    return this.api
      .get<ApiResponse<PublicComment[]>>(
        `${this.endpoint}/news/${encodeURIComponent(newsId)}`,
        params,
      )
      .pipe(map((response) => response.data));
  }

  create(
    newsId: string,
    dto: CreateCommentDto,
  ): Observable<CreateCommentResponse> {
    return this.api
      .post<ApiResponse<CreateCommentResponse>>(
        `${this.endpoint}/news/${encodeURIComponent(newsId)}`,
        dto,
      )
      .pipe(map((response) => response.data));
  }

  toggleLike(
    newsId: string,
    commentId: string,
    sortBy: CommentSort = 'newest',
  ): Observable<ToggleCommentLikeResponse> {
    const query = new URLSearchParams({ sortBy }).toString();
    return this.api
      .post<ApiResponse<ToggleCommentLikeResponse>>(
        `${this.endpoint}/news/${encodeURIComponent(newsId)}/${encodeURIComponent(commentId)}/like?${query}`,
        {},
      )
      .pipe(map((response) => response.data));
  }
}
