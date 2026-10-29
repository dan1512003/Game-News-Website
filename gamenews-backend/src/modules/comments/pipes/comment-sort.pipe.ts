import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

export type CommentSort = 'newest' | 'popular';

@Injectable()
export class CommentSortPipe
  implements PipeTransform<unknown, CommentSort>
{
  transform(value: unknown): CommentSort {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return 'newest';
    }

    if (value === 'newest' || value === 'popular') {
      return value;
    }

    throw new BadRequestException(
      'sortBy chỉ chấp nhận newest hoặc popular',
    );
  }
}