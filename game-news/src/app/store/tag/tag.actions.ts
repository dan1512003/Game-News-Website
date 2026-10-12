
import { createAction, props } from '@ngrx/store';

import {
  CreateTagDto,
  DeleteTagResponse,
  Tag,
  TagDashboardStats,
  TagListResponse,
  TagOption,
  TagQuery,
  UpdateTagDto,
} from './models/tag.model';

// Dashboard stats
export const loadTagDashboardStats = createAction(
  '[Tags] Load Dashboard Stats',
);

export const loadTagDashboardStatsSuccess = createAction(
  '[Tags] Load Dashboard Stats Success',
  props<{ stats: TagDashboardStats }>(),
);

export const loadTagDashboardStatsFailure = createAction(
  '[Tags] Load Dashboard Stats Failure',
  props<{ error: string }>(),
);

// Danh sách phân trang
export const loadTags = createAction(
  '[Tags] Load Tags',
  props<{ query: TagQuery }>(),
);

export const loadTagsSuccess = createAction(
  '[Tags] Load Tags Success',
  props<{ response: TagListResponse }>(),
);

export const loadTagsFailure = createAction(
  '[Tags] Load Tags Failure',
  props<{ error: string }>(),
);

// Toàn bộ tag options
export const loadTagOptions = createAction(
  '[Tags] Load Tag Options',
);

export const loadTagOptionsSuccess = createAction(
  '[Tags] Load Tag Options Success',
  props<{ options: TagOption[] }>(),
);

export const loadTagOptionsFailure = createAction(
  '[Tags] Load Tag Options Failure',
  props<{ error: string }>(),
);

// Chi tiết
export const loadTagById = createAction(
  '[Tags] Load Tag By Id',
  props<{ id: string }>(),
);

export const loadTagByIdSuccess = createAction(
  '[Tags] Load Tag By Id Success',
  props<{ tag: Tag }>(),
);

export const loadTagByIdFailure = createAction(
  '[Tags] Load Tag By Id Failure',
  props<{ error: string }>(),
);

// Tạo mới
export const createTag = createAction(
  '[Tags] Create Tag',
  props<{ dto: CreateTagDto }>(),
);

export const createTagSuccess = createAction(
  '[Tags] Create Tag Success',
  props<{ tag: Tag }>(),
);

export const createTagFailure = createAction(
  '[Tags] Create Tag Failure',
  props<{ error: string }>(),
);

// Cập nhật
export const updateTag = createAction(
  '[Tags] Update Tag',
  props<{ id: string; dto: UpdateTagDto }>(),
);

export const updateTagSuccess = createAction(
  '[Tags] Update Tag Success',
  props<{ tag: Tag }>(),
);

export const updateTagFailure = createAction(
  '[Tags] Update Tag Failure',
  props<{ error: string }>(),
);

// Xóa
export const deleteTag = createAction(
  '[Tags] Delete Tag',
  props<{ id: string }>(),
);

export const deleteTagSuccess = createAction(
  '[Tags] Delete Tag Success',
  props<{ response: DeleteTagResponse }>(),
);

export const deleteTagFailure = createAction(
  '[Tags] Delete Tag Failure',
  props<{ error: string }>(),
);

// Xóa thông báo
export const clearTagMessages = createAction(
  '[Tags] Clear Messages',
);