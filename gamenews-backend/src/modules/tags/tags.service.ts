import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TagEntity } from './entities/tag.entity/tag.entity.js';
import { CreateTagDto } from './dto/create-tag.dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto/update-tag.dto.js';
import { QueryTagDto } from './dto/query-tag.dto/query-tag.dto.js';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  // Danh sách + tìm kiếm + phân trang
  async findAll(query: QueryTagDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const qb = this.tagRepository
      .createQueryBuilder('tag')
      .orderBy('tag.tagId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        `(
          tag.name ILIKE :search
          OR COALESCE(tag.description, '') ILIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((tag) => ({
        tag_id: tag.tagId,
        name: tag.name,
        description: tag.description,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
// Toàn bộ tag dùng cho select / options
async findAllOptions() {
  const tagOptions = await this.tagRepository.find({
    select: {
      tagId: true,
      name: true,
    },
    order: {
      tagId: 'DESC',
    },
  });

  const tags = tagOptions.map((tag) => ({
    tag_id: tag.tagId,
    name: tag.name,
  }));

  return tags;
}
  // Chi tiết
  async findOne(id: string) {
    const tag = await this.tagRepository.findOne({
      where: { tagId: id },
    });

    if (!tag) {
      throw new NotFoundException('Không tìm thấy thẻ bài viết');
    }

    return tag;
  }

  // Tạo
  async create(dto: CreateTagDto) {
    const name = dto.name.trim();

    await this.ensureNameAvailable(name);

    const tag = this.tagRepository.create({
      name,
      description: dto.description?.trim() || null,
    });

    try {
      const saved = await this.tagRepository.save(tag);

      return {
        tag_id: saved.tagId,
        name: saved.name,
        description: saved.description,
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // Sửa
  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.findOne(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      await this.ensureNameAvailable(name, id);
      tag.name = name;
    }

    if (dto.description !== undefined) {
      tag.description = dto.description?.trim() || null;
    }

    try {
      const saved = await this.tagRepository.save(tag);

      return {
        tag_id: saved.tagId,
        name: saved.name,
        description: saved.description,
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // Xóa
  async remove(id: string) {
    const tag = await this.findOne(id);

    try {
      await this.tagRepository.remove(tag);

      return {
        message: 'Xóa thẻ thành công',
        tag_id: id,
      };
    } catch (error) {
      const err = error as { code?: string };

      if (err.code === '23503') {
        throw new ConflictException(
          'Không thể xóa thẻ đang được bài viết sử dụng',
        );
      }

      throw error;
    }
  }

  private async ensureNameAvailable(
    name: string,
    excludeId?: string,
  ) {
    const qb = this.tagRepository
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) = LOWER(:name)', { name });

    if (excludeId) {
      qb.andWhere('tag.tagId != :excludeId', { excludeId });
    }

    if (await qb.getOne()) {
      throw new ConflictException('Tên thẻ đã tồn tại');
    }
  }

  private handleDatabaseError(error: unknown): never {
    const err = error as { code?: string };

    if (err.code === '23505') {
      throw new ConflictException('Tên thẻ đã tồn tại');
    }

    throw error;
  }
  
async getDashboardStats() {
  const total = await this.tagRepository.count();

  return {
    total,
  };
}
}