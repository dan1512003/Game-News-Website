
import { createReducer, on } from '@ngrx/store';

import { initialTagState } from './tag.state';
import * as TagActions from './tag.actions';

export const tagReducer = createReducer(
  initialTagState,

  // Toàn bộ tag options
  on(TagActions.loadTagOptions, (state) => ({
    ...state,
    optionsLoading: true,
    optionsError: null,
  })),

  on(TagActions.loadTagOptionsSuccess, (state, { options }) => ({
    ...state,
    options,
    optionsLoading: false,
    optionsError: null,
  })),

  on(TagActions.loadTagOptionsFailure, (state, { error }) => ({
    ...state,
    optionsLoading: false,
    optionsError: error,
  })),

  // Danh sách phân trang
  on(TagActions.loadTags, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TagActions.loadTagsSuccess, (state, { response }) => ({
    ...state,
    tags: response.items,
    meta: response.meta,
    loading: false,
    error: null,
  })),

  on(TagActions.loadTagsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Chi tiết
  on(TagActions.loadTagById, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TagActions.loadTagByIdSuccess, (state, { tag }) => ({
    ...state,
    selectedTag: tag,
    loading: false,
    error: null,
  })),

  on(TagActions.loadTagByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Tạo mới
  on(TagActions.createTag, (state) => ({
    ...state,
    submitting: true,
    error: null,
    successMessage: null,
  })),

  on(TagActions.createTagSuccess, (state, { tag }) => ({
    ...state,
    tags: [
      tag,
      ...state.tags.filter((item) => item.tag_id !== tag.tag_id),
    ],
    options: [
      { tag_id: tag.tag_id, name: tag.name },
      ...state.options.filter((item) => item.tag_id !== tag.tag_id),
    ],
    submitting: false,
    error: null,
    successMessage: 'Tạo thẻ thành công',
  })),

  on(TagActions.createTagFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    error,
  })),

  // Cập nhật
  on(TagActions.updateTag, (state) => ({
    ...state,
    submitting: true,
    error: null,
    successMessage: null,
  })),

  on(TagActions.updateTagSuccess, (state, { tag }) => ({
    ...state,
    tags: state.tags.map((item) =>
      item.tag_id === tag.tag_id ? tag : item,
    ),
    options: state.options.map((item) =>
      item.tag_id === tag.tag_id
        ? { tag_id: tag.tag_id, name: tag.name }
        : item,
    ),
    selectedTag:
      state.selectedTag?.tag_id === tag.tag_id
        ? tag
        : state.selectedTag,
    submitting: false,
    error: null,
    successMessage: 'Cập nhật thẻ thành công',
  })),

  on(TagActions.updateTagFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    error,
  })),

  // Xóa
  on(TagActions.deleteTag, (state) => ({
    ...state,
    deleting: true,
    error: null,
    successMessage: null,
  })),

  on(TagActions.deleteTagSuccess, (state, { response }) => ({
    ...state,
    tags: state.tags.filter(
      (tag) => tag.tag_id !== response.tag_id,
    ),
    options: state.options.filter(
      (tag) => tag.tag_id !== response.tag_id,
    ),
    selectedTag:
      state.selectedTag?.tag_id === response.tag_id
        ? null
        : state.selectedTag,
    deleting: false,
    error: null,
    successMessage: response.message,
  })),

  on(TagActions.deleteTagFailure, (state, { error }) => ({
    ...state,
    deleting: false,
    error,
  })),

  // Xóa thông báo
  on(TagActions.clearTagMessages, (state) => ({
    ...state,
    error: null,
    successMessage: null,
  })),

  
on(TagActions.loadTagDashboardStats, (state) => ({
  ...state,
  dashboardStatsLoading: true,
  dashboardStatsError: null,
})),

on(
  TagActions.loadTagDashboardStatsSuccess,
  (state, { stats }) => ({
    ...state,
    dashboardStats: stats,
    dashboardStatsLoading: false,
    dashboardStatsError: null,
  }),
),

on(
  TagActions.loadTagDashboardStatsFailure,
  (state, { error }) => ({
    ...state,
    dashboardStatsLoading: false,
    dashboardStatsError: error,
  }),
),
);