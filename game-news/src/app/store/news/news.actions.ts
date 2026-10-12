import { createAction, props } from '@ngrx/store';
import type { NewsBlockImageUpload } from './services/news.service';
import {
  CreateNewsDto,
  NewsData,
  NewsActionResponse,
  NewsListResponse,
  NewsNoteDto,
  NewsQuery,
  ScheduleNewsDto,
  UpdateNewsDto,
  NewsDashboardStats,
} from './models/news.model'

// =========================
// LOAD LIST
// =========================

export const loadNews = createAction(
  '[News] Load News',
  props<{ query?: NewsQuery }>(),
);

export const loadNewsSuccess = createAction(
  '[News] Load News Success',
  props<{ response: NewsListResponse }>(),
);

export const loadNewsFailure = createAction(
  '[News] Load News Failure',
  props<{ error: string }>(),
);

// =========================
// LOAD DETAIL
// =========================

export const loadNewsById = createAction(
  '[News] Load News By Id',
  props<{ id: string }>(),
);

export const loadNewsByIdSuccess = createAction(
  '[News] Load News By Id Success',
  props<{ news: NewsData }>(),
);

export const loadNewsByIdFailure = createAction(
  '[News] Load News By Id Failure',
  props<{ error: string }>(),
);

// =========================
// CREATE
// =========================

export const createNews = createAction(
  '[News] Create News',
  props<{ dto: CreateNewsDto; file?: File | null , blockImages?: NewsBlockImageUpload[];}>(),
);

export const createNewsSuccess = createAction(
  '[News] Create News Success',
  props<{ news: NewsData }>(),
);

export const createNewsFailure = createAction(
  '[News] Create News Failure',
  props<{ error: string }>(),
);

export const updateNews = createAction(
  '[News] Update News',
  props<{
    id: string;
    dto: UpdateNewsDto;
    file?: File | null;
     blockImages?: NewsBlockImageUpload[];
  }>(),
);

export const updateNewsSuccess = createAction(
  '[News] Update News Success',
  props<{ news: NewsData }>(),
);

export const updateNewsFailure = createAction(
  '[News] Update News Failure',
  props<{ error: string }>(),
);

// =========================
// DELETE
// =========================

export const deleteNews = createAction(
  '[News] Delete News',
  props<{ id: string }>(),
);

export const deleteNewsSuccess = createAction(
  '[News] Delete News Success',
  props<{
    id: string;
    response: NewsActionResponse;
  }>(),
);

export const deleteNewsFailure = createAction(
  '[News] Delete News Failure',
  props<{ error: string }>(),
);

// =========================
// WORKFLOW ACTIONS
// =========================

export const applyNews = createAction(
  '[News] Apply',
  props<{ id: string }>(),
);

export const publishNews = createAction(
  '[News] Publish',
  props<{ id: string }>(),
);

export const submitNews = createAction(
  '[News] Submit',
  props<{ id: string }>(),
);

export const unsubmitNews = createAction(
  '[News] Unsubmit',
  props<{ id: string }>(),
);

export const returnNewsToAuthor = createAction(
  '[News] Return To Author',
  props<{ id: string; dto: NewsNoteDto }>(),
);

export const requireNewsEdit = createAction(
  '[News] Require Edit',
  props<{ id: string; dto: NewsNoteDto }>(),
);

export const unrequireNewsEdit = createAction(
  '[News] Unrequire Edit',
  props<{ id: string }>(),
);

export const scheduleNews = createAction(
  '[News] Schedule',
  props<{ id: string; dto: ScheduleNewsDto }>(),
);

export const unscheduleNews = createAction(
  '[News] Unschedule',
  props<{ id: string }>(),
);

export const unpublishNews = createAction(
  '[News] Unpublish',
  props<{ id: string }>(),
);

// Dùng chung cho kết quả các workflow action.
// Các action này trả về News từ backend.
export const newsWorkflowSuccess = createAction(
  '[News] Workflow Success',
  props<{ news: NewsData; message: string }>(),
);

export const newsWorkflowFailure = createAction(
  '[News] Workflow Failure',
  props<{ error: string }>(),
);

// =========================
// RESET / CLEAR
// =========================

export const clearSelectedNews = createAction(
  '[News] Clear Selected News',
);

export const clearNewsError = createAction(
  '[News] Clear Error',
);
// =====================================================
// DASHBOARD STATS
// =====================================================

export const loadNewsDashboardStats = createAction(
  '[News] Load Dashboard Stats',
);

export const loadNewsDashboardStatsSuccess = createAction(
  '[News] Load Dashboard Stats Success',
  props<{ stats: NewsDashboardStats }>(),
);

export const loadNewsDashboardStatsFailure = createAction(
  '[News] Load Dashboard Stats Failure',
  props<{ error: string }>(),
);