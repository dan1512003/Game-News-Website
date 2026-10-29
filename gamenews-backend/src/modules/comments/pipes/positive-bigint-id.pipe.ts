import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PositiveBigIntIdPipe
  implements PipeTransform<unknown, string>
{
  private readonly MAX_BIGINT = 9223372036854775807n;

  transform(value: unknown): string {
    if (
      typeof value !== 'string' ||
      !/^[1-9]\d*$/.test(value)
    ) {
      throw new BadRequestException(
        'ID phải là số nguyên dương hợp lệ',
      );
    }

    if (BigInt(value) > this.MAX_BIGINT) {
      throw new BadRequestException(
        'ID vượt quá giới hạn PostgreSQL bigint',
      );
    }

    return value;
  }
}