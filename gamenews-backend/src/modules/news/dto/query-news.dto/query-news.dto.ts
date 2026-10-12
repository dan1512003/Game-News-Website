import { Type } from 'class-transformer';

import {
IsIn,
IsInt,
IsOptional,
IsString,
Max,
Min,
} from 'class-validator';

export const NEWS_FILTERS = [
'published',
'mine',
'submitted',
'processing',
'scheduled',
'draft',
'returned',
'required',
] as const;

export type NewsFilter = (typeof NEWS_FILTERS)[number];

export class QueryNewsDto {
@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
page = 1;

@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
@Max(100)
limit = 10;

@IsOptional()
@IsString()
search?: string;

@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
categoryId?: number;

// Lọc theo tab trên giao diện
@IsOptional()
@IsIn(NEWS_FILTERS)
filter?: NewsFilter;

// Lọc theo trạng thái cụ thể nếu cần
@IsOptional()
@IsIn([
'draft',
'submitted',
'processing',
'returned',
'scheduled',
'published',
])
status?: string;
}
