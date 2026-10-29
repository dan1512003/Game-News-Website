import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString({
    message: 'Nội dung bình luận phải là chuỗi',
  })
  @MinLength(1, {
    message: 'Nội dung bình luận không được để trống',
  })
  @MaxLength(5000, {
    message: 'Nội dung bình luận không được vượt quá 5000 ký tự',
  })
  content: string;

  @Transform(({ value }) =>
    value === '' || value === null
      ? undefined
      : value,
  )
  @IsOptional()
  @IsString({
    message: 'ID bình luận cha phải là chuỗi',
  })
  @Matches(/^[1-9]\d*$/, {
    message: 'ID bình luận cha phải là số nguyên dương',
  })
  parentId?: string;
}