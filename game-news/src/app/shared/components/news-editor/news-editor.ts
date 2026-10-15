import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  ViewChild,
  OnInit,
  OnDestroy,
  DestroyRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import {
  NewsData,
  NewsRole,
  CreateNewsDto,
  UpdateNewsDto,
} from '../../../store/news/models/news.model';

import * as NewsActions from '../../../store/news/news.actions';

import * as CategoryActions from '../../../store/category/category.actions';
import * as CategorySelectors from '../../../store/category/category.selectors';

import * as TagActions from '../../../store/tag/tag.actions';
import * as TagSelectors from '../../../store/tag/tag.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as  UserSelectors from '../../../store/users/users.selectors'
import * as   UserActions from '../../../store/users/users.actions'
export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'image'
  | 'quote';

export type NewsAction =
  | 'draft'
  | 'save'
  | 'apply'
  | 'submit'
  | 'unsubmitted'
  | 'return'
  | 'schedule'
  | 'publish'
  | 'unpublish'
  | 'required'
  | 'unrequired'
  | 'unschedule'
  | 'edit';

export interface EditorBlock {
  id: number;
  type: BlockType;
  content: string;
  imageFile?: File | null;
  imagePreview?: string;
}

interface BlockMeta {
  label: string;
  badge: string;
  color: string;
  placeholder: string;
}

export interface NewsEditorForm {
  news_id: number | string;
  title: string;
  category_id: number | string | null;
  author_id: number | string;
  author_name:string | null;
  thumbnail: string;
  published_at: string;
  status: string;
  views: number;
  reviewer_id: number | string | null;
  editor_note: string;
  requirement_note: string;
}

@Component({
  selector: 'app-news-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-editor.html',
  styleUrl: './news-editor.css',
})
export class NewsEditor implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
private readonly actions$ = inject(Actions);
private readonly destroyRef = inject(DestroyRef);
  @Input() news: NewsData | null = null;
  @Input() initialBlocks: EditorBlock[] = [];
  @Input() initialTagIds: Array<number | string> = [];
  @Input() initialReview: unknown = null;

  @Input() currentUser!: {
    id:  string;
    name: string;
    role: NewsRole;
  };

  @Input() viewOnly = false;

  // Giữ close, chỉ bỏ @Output() save.
  @Output() close = new EventEmitter<void>();

  @ViewChild('tabsContent')
  tabsContent!: ElementRef<HTMLDivElement>;

  // =====================================================
  // CATEGORY
  // =====================================================

  readonly categories = this.store.selectSignal(
    CategorySelectors.selectCategoryOptions,
  );

  readonly categoriesLoading = this.store.selectSignal(
    CategorySelectors.selectCategoryOptionsLoading,
  );

  readonly categoriesError = this.store.selectSignal(
    CategorySelectors.selectCategoryOptionsError,
  );

  // =====================================================
  // TAG
  // =====================================================

  readonly tags = this.store.selectSignal(
    TagSelectors.selectAllTags,
  );

  readonly tagsLoading = this.store.selectSignal(
    TagSelectors.selectTagLoading,
  );

  readonly tagsError = this.store.selectSignal(
    TagSelectors.selectTagError,
  );

  // =====================================================
  // UI STATE
  // =====================================================

  hasScroll = false;

  tab: 'basic' | 'content' | 'meta' | 'other' = 'basic';

  showPreview = false;
  showRequirementDialog = false;
  showReturnDialog = false;
  showScheduleDialog = false;
  selectedThumbnail: File | null = null;

  thumbnailPreview = '';

  thumbnailError = '';
  readonly blockTypes: BlockType[] = [
    'paragraph',
    'heading1',
    'heading2',
    'image',
    'quote',
  ];

  blocks: EditorBlock[] = [];
  nextId = 1000;

  scheduleDate = '';
  scheduleTime = '08:00';

  // =====================================================
  // NEWS FORM
  // =====================================================

  form: NewsEditorForm = {
    news_id: 0,
    title: '',
    category_id: null,
    author_id: '',
    thumbnail: '',
    published_at: '',
    status: 'draft',
    views: 0,
    reviewer_id: null,
    editor_note: '',
    requirement_note: '',
    author_name:null
  };

  selectedTags: Array<number | string> = [];

  review: any = null;

  editorNote = '';
  requiredNote = '';

  // =====================================================
  // BLOCK META
  // =====================================================

  readonly blockMeta: Record<BlockType, BlockMeta> = {
    paragraph: {
      label: 'Đoạn văn',
      badge: 'P',
      color: '#6b6560',
      placeholder: 'Nhập nội dung đoạn văn...',
    },
    heading1: {
      label: 'Tiêu đề lớn',
      badge: 'H1',
      color: '#ff5c00',
      placeholder: 'Tiêu đề lớn...',
    },
    heading2: {
      label: 'Tiêu đề vừa',
      badge: 'H2',
      color: '#f59e0b',
      placeholder: 'Tiêu đề vừa...',
    },
    image: {
      label: 'Hình ảnh',
      badge: '⬛',
      color: '#3b82f6',
      placeholder: 'Dán URL hình ảnh...',
    },
    quote: {
      label: 'Trích dẫn',
      badge: '❝',
      color: '#a78bfa',
      placeholder: 'Nhập nội dung trích dẫn...',
    },
  };
  authorName = '';
reviewerName = '';
  readonly selectedUser = this.store.selectSignal(
  UserSelectors.selectSelectedUser,
);
private readonly API_URL = 'http://localhost:3001';


getThumbnailUrl(thumbnail: string | null | undefined): string {
  console.log('========== DEBUG THUMBNAIL ==========');
  console.log('1. Thumbnail đầu vào:', thumbnail);
  console.log('2. API_URL:', this.API_URL);

  if (!thumbnail?.trim()) {
    console.warn('Thumbnail đang rỗng hoặc null!');
    return '';
  }

  // Nếu backend đã trả URL đầy đủ.
  if (/^https?:\/\//i.test(thumbnail)) {
    console.log('3. URL ảnh đầy đủ:', thumbnail);
    return thumbnail;
  }

  // Nếu backend trả đường dẫn /uploads/news/abc.jpg.
  const imageUrl =
    `${this.API_URL}/${thumbnail.replace(/^\/+/, '')}`;

  console.log('3. URL ảnh sau khi ghép:', imageUrl);
  console.log('====================================');

  return imageUrl;
}



onBlockImageSelected(
  event: Event,
  block: EditorBlock,
): void {
  if (this.viewOnly) return;

  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (!allowedTypes.includes(file.type)) {
    input.value = '';
    alert('Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    input.value = '';
    alert('Ảnh không được vượt quá 5 MB.');
    return;
  }

  // Hủy preview cũ của chính block này
  const oldUrl = this.blockImagePreviewUrls.get(block.id);

  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
  }

  // Gán file mới
  block.imageFile = file;

  // Tạo preview mới
  const newUrl = URL.createObjectURL(file);

  this.blockImagePreviewUrls.set(
    block.id,
    newUrl,
  );
}
private blockImagePreviewUrls = new Map<number, string>();

getBlockImagePreview(block: EditorBlock): string {
  if (!block.imageFile) return '';

  const cachedUrl = this.blockImagePreviewUrls.get(block.id);

  if (cachedUrl) {
    return cachedUrl;
  }

  const url = URL.createObjectURL(block.imageFile);
  this.blockImagePreviewUrls.set(block.id, url);

  return url;
}

  // =====================================================
  // INIT
  // =====================================================
ngOnInit(): void {
  if (typeof document !== 'undefined') {
    document.body.classList.add('side-nav-open');
  }

  this.store.dispatch(
    CategoryActions.loadCategoryOptions(),
  );

  this.store.dispatch(
    TagActions.loadTags({
      query: {
        page: 1,
        limit: 100,
      },
    }),
  );

  this.initializeForm();

this.loadUserNameById(this.form.author_id, 'author');
this.loadUserNameById(this.form.reviewer_id, 'reviewer');
  // Đóng editor khi tạo hoặc cập nhật bài viết thành công
  this.actions$
    .pipe(
      ofType(
        NewsActions.createNewsSuccess,
        NewsActions.updateNewsSuccess,
      ),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(() => {
      this.closeEditor();
    });

    this.actions$
  .pipe(
    ofType(UserActions.loadUserByIdSuccess),
    takeUntilDestroyed(this.destroyRef),
  )
  .subscribe(({ user }) => {
    const userId = user.user_id;
    
    if (this.sameId(userId, this.form.author_id)) {
      this.authorName = user.username;
  
    }

    if (this.sameId(userId, this.form.reviewer_id)) {
      this.reviewerName = user.username;
    }
  });
}

  private initializeForm(): void {
    const article = this.news;

    this.form = {
      news_id: article?.news_id ?? 0,
      title: article?.title ?? '',
      category_id: article?.category_id ?? null,
      author_id: article?.author_id ?? this.currentUser?.id ?? '',
   author_name: article?.author?.username ?? '',
      thumbnail: article?.thumbnail ?? '',
      published_at: this.formatDateForInput(
        article?.published_at ?? '',
      ),
      status: article?.status ?? 'draft',
      views: Number(article?.views ?? 0),
      reviewer_id: article?.reviewer_id ?? null,
      editor_note: article?.editor_note ?? '',
      requirement_note: article?.requirement_note ?? '',
    };



    this.blocks = [...(this.initialBlocks ?? [])]
      .sort(
        (a, b) =>
          ((a as any).position ?? 0) -
          ((b as any).position ?? 0),
      )
      .map((block, index) => ({
        id: block.id ?? index + 1,
        type: block.type,
        content: block.content ?? '',
      }));
console.log('initialBlocks:', this.initialBlocks);
console.log('blocks sau khi gán:', this.blocks);
console.table(this.blocks);
    this.nextId =
      Math.max(999, ...this.blocks.map((block) => block.id)) + 1;

    this.selectedTags = [...(this.initialTagIds ?? [])];

    this.review = this.initialReview;
    this.editorNote = article?.editor_note ?? '';
    this.requiredNote = article?.requirement_note ?? '';
  }


ngOnDestroy(): void {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('side-nav-open');
  }

  this.releaseThumbnailPreview();
}

//ko caanf ham nayf cos thee laay truc tiếp tại new kia
private loadUserNameById(
  userId: number | string | null | undefined,
  type: 'author' | 'reviewer',
): void {
  
  if (userId == null || String(userId).trim() === '') {
    if (type === 'author') {
      
      this.authorName = 'Tác giả';
    } else {
      this.reviewerName = 'Chưa có biên tập viên';
    }

    return;
  }

  this.store.dispatch(
    UserActions.loadUserById({
      id: String(userId),
    }),
  );

  console.log(`[${type.toUpperCase()}] Load user ID:`, userId);
}
  // =====================================================
  // ID COMPARISON
  // =====================================================

  sameId(
    first: number | string | null | undefined,
    second: number | string | null | undefined,
  ): boolean {
    if (first == null || second == null) {
      return first == null && second == null;
    }

    return String(first) === String(second);
  }

  // =====================================================
  // CATEGORY
  // =====================================================

  getCategoryName(
    categoryId: number | string | null | undefined,
  ): string {
    if (categoryId == null || categoryId === '') {
      return 'Chưa có danh mục';
    }

    const category = this.categories().find(
      (item: any) =>
        this.sameId(item.category_id, categoryId),
    );

    return category?.name ?? 'Chưa phân loại';
  }

  isCategorySelected(id: number | string): boolean {
    return this.sameId(this.form.category_id, id);
  }

  toggleCategory(id: number | string): void {
    if (this.viewOnly) {
      return;
    }

    this.form.category_id = this.isCategorySelected(id)
      ? null
      : id;
  }

  // =====================================================
  // TAG
  // =====================================================

  toggleTag(id: number | string): void {
    if (this.viewOnly) {
      return;
    }

    const exists = this.isTagSelected(id);

    this.selectedTags = exists
      ? this.selectedTags.filter(
          (tagId) => !this.sameId(tagId, id),
        )
      : [...this.selectedTags, id];
  }

  isTagSelected(id: number | string): boolean {
    return this.selectedTags.some(
      (tagId) => this.sameId(tagId, id),
    );
  }

  // =====================================================
  // USER
  // =====================================================


getUserName(
  userId: number | string | null | undefined,
): string {
  console.log('========== DEBUG GET USER NAME ==========');
  console.log('1. userId đầu vào:', userId);
  console.log('2. author_id:', this.form.author_id);
  console.log('3. reviewer_id:', this.form.reviewer_id);
  console.log('4. authorName:', this.authorName);
  console.log('5. reviewerName:', this.reviewerName);

  if (userId == null || String(userId).trim() === '') {
    return 'Chưa xác định';
  }

  // Nếu ID là tác giả
  if (this.sameId(userId, this.form.author_id)) {
    return this.authorName || 'Tác giả';
  }

  // Nếu ID là biên tập viên
  if (this.sameId(userId, this.form.reviewer_id)) {
    return this.reviewerName || 'Biên tập viên';
  }

  // Nếu ID là người đang đăng nhập
  if (this.sameId(userId, this.currentUser?.id)) {
    return this.currentUser?.name ?? 'Người dùng';
  }

  console.warn('Không tìm thấy tên tương ứng với userId:', userId);

  return 'Người dùng';
}




  // =====================================================
  // DATE
  // =====================================================

  private formatDateForInput(
    date: string | Date | null | undefined,
  ): string {
    if (!date) {
      return '';
    }

    const value = String(date).trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.substring(0, 10);
    }

    const match = value.match(
      /^(\d{2})[/-](\d{2})[/-](\d{4})$/,
    );

    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // =====================================================
  // TAB
  // =====================================================

  setTab(tab: 'basic' | 'content' | 'meta' | 'other'): void {
    this.tab = tab;
  }

  // =====================================================
  // BLOCKS
  // =====================================================

  addBlock(type: BlockType): void {
    if (this.viewOnly) {
      return;
    }

    this.blocks = [
      ...this.blocks,
      {
        id: this.nextId++,
        type,
        content: '',
      },
    ];

    this.tab = 'content';
  }

  updateBlock(block: EditorBlock, content: string): void {
    if (this.viewOnly) {
      return;
    }

    block.content = content;
  }

  deleteBlock(id: number): void {
    if (this.viewOnly) {
      return;
    }

    this.blocks = this.blocks.filter(
      (block) => block.id !== id,
    );
  }

  moveBlock(index: number, direction: -1 | 1): void {
    if (this.viewOnly) {
      return;
    }

    const target = index + direction;

    if (target < 0 || target >= this.blocks.length) {
      return;
    }

    const updated = [...this.blocks];

    [updated[index], updated[target]] = [
      updated[target],
      updated[index],
    ];

    this.blocks = updated;
  }








// cos the chuan hoas tại nest back end ko ccan phai font end nhu the này
saveArticle(status?: string): void {
  console.log('========== SAVE ARTICLE START ==========');

  

  // 1. Kiểm tra tiêu đề
  const title = this.form.title.trim();

  if (!title) {
    console.warn('Tiêu đề không được để trống.');
    this.tab = 'basic';
    return;
  }

  // 2. Chuyển categoryId thành number
  const rawCategoryId = this.form.category_id;

  const categoryId =
    rawCategoryId == null || String(rawCategoryId).trim() === ''
      ? null
      : Number(rawCategoryId);

  if (
    categoryId === null ||
    !Number.isInteger(categoryId) ||
    categoryId < 1
  ) {
    console.warn('Chưa chọn danh mục hợp lệ.');
    this.tab = 'basic';
    return;
  }

  // 3. Kiểm tra trạng thái
  const allowedStatuses = [
    'draft',
    'submitted',
    'processing',
    'returned',
    'scheduled',
    'published',
  ] as const;

  type AllowedStatus = (typeof allowedStatuses)[number];

  const requestedStatus = status ?? this.form.status;

  const newsStatus: AllowedStatus = allowedStatuses.includes(
    requestedStatus as AllowedStatus,
  )
    ? (requestedStatus as AllowedStatus)
    : 'draft';

  // 4. Tạo slug từ tiêu đề
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 5. Chuẩn hóa nội dung bài viết
  const contentBlocks: import(
    '../../../shared/models/common/common'
  ).NewsContentBlockInput[] = this.blocks.map((block, index) => ({
    type: block.type,
    content: block.content,
      position: index + 1,
  }));
const blockImages = this.blocks
  .map((block, index) => ({
    position: index + 1,
    file: block.imageFile,
  }))
  .filter(
    (item): item is { position: number; file: File } =>
      item.file instanceof File,
  );
  // 6. Sửa tagIds thành number[]
const tagIds: number[] = this.selectedTags
  .map((id) => Number(id))
  .filter((id) => Number.isInteger(id) && id > 0);

console.log('selectedTags ban đầu:', this.selectedTags);
console.log('tagIds sau khi chuyển đổi:', tagIds);
console.log('Kiểu dữ liệu tagIds:', tagIds.map((id) => typeof id));
  // 7. Chuẩn hóa thumbnail
  const thumbnail = this.form.thumbnail.trim() || null;

console.log('[AUTHOR] currentUser:', this.currentUser);

console.log('[AUTHOR] currentUser.id:', this.currentUser?.id);

console.log('[AUTHOR] form.author_id:', this.form.author_id);
  // 8. Chuẩn hóa authorId
  const authorId = String(
    this.form.author_id || this.currentUser?.id || '',
  ).trim();

  if (!authorId) {
    console.warn('Không xác định được tác giả bài viết.');
    return;
  }
console.log('========== DEBUG REVIEWER ID ==========');
console.log('[1] form.reviewer_id:', this.form.reviewer_id);
console.log('[2] Kiểu dữ liệu:', typeof this.form.reviewer_id);

const reviewerId =
  this.form.reviewer_id == null ||
  String(this.form.reviewer_id).trim() === ''
    ? null
    : String(this.form.reviewer_id).trim();

console.log('[3] reviewerId sau chuẩn hóa:', reviewerId);
console.log('[4] Kiểu reviewerId:', typeof reviewerId);
console.log('========================================');

  // 10. Chuẩn hóa số lượt xem
  const parsedViews = Number(this.form.views ?? 0);
  const views =
    Number.isInteger(parsedViews) && parsedViews >= 0
      ? parsedViews
      : 0;

  // 11. Chuẩn hóa ngày xuất bản
  const publishedAt = this.form.published_at
    ? new Date(this.form.published_at).toISOString()
    : null;

  // 12. Ngày lên lịch chỉ có giá trị khi trạng thái scheduled
  const scheduledAt =
    newsStatus === 'scheduled' ? publishedAt : null;

  // 13. Chuẩn hóa ghi chú
  const editorNote = this.form.editor_note.trim() || null;

  const requirementNote =
    this.form.requirement_note.trim() || null;

  // 14. Xác định ID bài viết
  const newsId = String(this.form.news_id ?? '').trim();

  // 15. Dữ liệu dùng chung cho create và update
  const commonFields = {
    title,
    slug,
    categoryId,
    thumbnail,
    status: newsStatus,
    tagIds,
    contentBlocks,
  };

  console.log('[SAVE] Dữ liệu chuẩn bị gửi:', {
    ...commonFields,
    authorId,
    reviewerId,
    views,
    publishedAt,
    scheduledAt,
    editorNote,
    requirementNote,
  });

  // 16. Cập nhật bài viết nếu đã có ID
  if (newsId !== '' && newsId !== '0') {
    const dto: UpdateNewsDto = {
      ...commonFields,
      authorId,
      reviewerId,
      views,
      publishedAt,
      scheduledAt,
      editorNote,
      requirementNote,
    };

    console.log('[UPDATE] ID:', newsId);
    console.log('[UPDATE] DTO:', dto);

    this.store.dispatch(
      NewsActions.updateNews({
        id: newsId,
        dto,
         file: this.selectedThumbnail,
           blockImages,
      }),
    );

    console.log('[UPDATE] Đã dispatch updateNews.');
    console.log('========== SAVE ARTICLE END ==========');
    return;
  }

  // 17. Tạo bài viết mới
  const dto: CreateNewsDto = {
    ...commonFields,
    authorId,
    reviewerId,
    views,
    publishedAt,
    scheduledAt,
    editorNote,
    requirementNote,
  };

  console.log('[CREATE] DTO:', dto);

  this.store.dispatch(
    NewsActions.createNews({ dto,
       file: this.selectedThumbnail,
         blockImages,
     }),
  );

  console.log('[CREATE] Đã dispatch createNews.');
  console.log('========== SAVE ARTICLE END ==========');
}





  // Không xóa close, vẫn phát sự kiện đóng editor.
  closeEditor(): void {
    this.close.emit();
  }

  // =====================================================
  // WORKFLOW
  // =====================================================

  handleAction(action: NewsAction): void {
    switch (action) {
      case 'edit':
        this.viewOnly = false;
        break;

      case 'draft':
        this.saveArticle('draft');
        break;

      case 'save':
        this.saveArticle();
        break;

      case 'submit':
        this.saveArticle('submitted');
        break;

      case 'publish':
           if (this.currentUser) {
          this.form.reviewer_id = this.currentUser.id;
       
        }

        this.saveArticle('published');
        break;

         case 'unpublish':
      if (this.currentUser) {
        this.form.reviewer_id = this.currentUser.id;
      }
      this.saveArticle('processing');
      break;
      case 'unschedule':
      case 'apply':
        if (this.currentUser) {
          this.form.reviewer_id = this.currentUser.id;
        }

        this.saveArticle('processing');
        break;

      case 'return':
        this.showReturnDialog = true;
        break;

      case 'required':
        this.showRequirementDialog = true;
        break;

      case 'unrequired':
        this.form.requirement_note = '';
        this.requiredNote = '';
        this.saveArticle();
        break;

      case 'schedule': {
             if (this.currentUser) {
          this.form.reviewer_id = this.currentUser.id;
        }

        this.showScheduleDialog = true;

        if (!this.scheduleDate) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          this.scheduleDate = [
            tomorrow.getFullYear(),
            String(tomorrow.getMonth() + 1).padStart(2, '0'),
            String(tomorrow.getDate()).padStart(2, '0'),
          ].join('-');
        }

        break;
      }

      case 'unsubmitted':
        this.saveArticle('draft');
        break;
    }
  }

  confirmRequire(): void {
    const note = this.requiredNote.trim();

    if (!note) {
      return;
    }

    this.form.requirement_note = note;
    this.showRequirementDialog = false;
    this.saveArticle('returned');
  }

  confirmReturn(): void {
    const note = this.editorNote.trim();

    if (!note) {
      return;
    }

    this.form.editor_note = note;
    this.showReturnDialog = false;
    this.saveArticle('returned');
  }

  confirmSchedule(): void {
    if (!this.scheduleDate || !this.scheduleTime) {
      return;
    }

    this.form.published_at =
      `${this.scheduleDate}T${this.scheduleTime}:00`;

    this.showScheduleDialog = false;
    this.saveArticle('scheduled');
  }

  // =====================================================
  // TAB SCROLL
  // =====================================================

  @HostListener('window:resize')
  onWindowResize(): void {
    requestAnimationFrame(() => {
      this.updateTabScrollButtons();
    });
  }

  onTabsScroll(): void {
    this.updateTabScrollButtons();
  }

  updateTabScrollButtons(): void {
    if (!this.tabsContent) {
      return;
    }

    const container = this.tabsContent.nativeElement;

    this.hasScroll =
      container.scrollWidth > container.clientWidth + 1;

    this.cdr.detectChanges();
  }

  scrollTabs(direction: 'left' | 'right'): void {
    if (!this.tabsContent) {
      return;
    }

    const container = this.tabsContent.nativeElement;
    const button = container.querySelector(
      'button',
    ) as HTMLElement | null;

    if (!button) {
      return;
    }

    const style = getComputedStyle(container);

    const gap =
      parseFloat(style.columnGap) ||
      parseFloat(style.gap) ||
      0;

    const amount = button.offsetWidth + gap;

    container.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.thumbnailError =
        'Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.';

      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.thumbnailError = 'Ảnh không được vượt quá 5 MB.';

      input.value = '';
      return;
    }

    this.thumbnailError = '';

    this.releaseThumbnailPreview();

    this.selectedThumbnail = file;
    this.thumbnailPreview = URL.createObjectURL(file);
  }

  removeThumbnail(input?: HTMLInputElement): void {
    this.releaseThumbnailPreview();

    this.selectedThumbnail = null;
    this.form.thumbnail = '';
    this.thumbnailError = '';

    if (input) {
      input.value = '';
    }
  }

  private releaseThumbnailPreview(): void {
    if (this.thumbnailPreview) {
      URL.revokeObjectURL(this.thumbnailPreview);
      this.thumbnailPreview = '';
    }
  }
}