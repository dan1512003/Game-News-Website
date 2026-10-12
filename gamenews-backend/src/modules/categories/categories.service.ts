import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from './entities/category.entity/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto/update-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto/query-category.dto.js';
import { NewsEntity } from '../news/entities/news.entity/news.entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // Lấy danh sách + tìm kiếm + phân trang + đếm bài viết
async findAll(query: QueryCategoryDto) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 5);
  const search = query.search?.trim();

  const qb = this.categoryRepository
    .createQueryBuilder('category')
    .addSelect(
      (subQuery) =>
        subQuery
          .select('COUNT(*)')
          .from(NewsEntity, 'news')
          .where('news.category_id = category.category_id'),
      'news_count',
    )
    .orderBy('category.categoryId', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  if (search) {
    qb.andWhere('category.name ILIKE :search', {
      search: `%${search}%`,
    });
  }

  const countQb = this.categoryRepository
    .createQueryBuilder('category');

  if (search) {
    countQb.where('category.name ILIKE :search', {
      search: `%${search}%`,
    });
  }

  const [result, total] = await Promise.all([
    qb.getRawAndEntities(),
    countQb.getCount(),
  ]);

  const { entities, raw } = result;

  return {
    items: entities.map((category: CategoryEntity, index: number) => ({
      category_id: category.categoryId,
      name: category.name,
      description: category.description,
      news_count: Number(raw[index]?.news_count ?? 0),
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}


async findAllOptions() {
  const categoryOptions = await this.categoryRepository.find({
    select: {
      categoryId: true,
      name: true,
    },
    order: {
      categoryId: 'DESC',
    },
  });

  const categories = categoryOptions.map((category) => ({
    category_id: category.categoryId,
    name: category.name,
  }));

  return categories;
}
  // Lấy chi tiết
  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { categoryId: id },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  // Tạo mới
  async create(dto: CreateCategoryDto) {
    
    const name = dto.name.trim();

    await this.ensureNameAvailable(name);

    const category = this.categoryRepository.create({
      name,
      description: dto.description?.trim() || null,
    });

    try {
      const saved = await this.categoryRepository.save(category);

      return {
        category_id: saved.categoryId,
        name: saved.name,
        description: saved.description,
        news_count: 0,
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // Cập nhật
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      await this.ensureNameAvailable(name, id);
      category.name = name;
    }

    if (dto.description !== undefined) {
      category.description = dto.description?.trim() || null;
    }

    try {
      const saved = await this.categoryRepository.save(category);

      return {
        category_id: saved.categoryId,
        name: saved.name,
        description: saved.description,
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // Xóa
  async remove(id: string) {
    const category = await this.findOne(id);

    try {
      await this.categoryRepository.remove(category);

      return {
        message: 'Xóa danh mục thành công',
        category_id: id,
      };
    } catch (error) {
      const err = error as { code?: string };

      if (err.code === '23503') {
        throw new ConflictException(
          'Không thể xóa danh mục đang được bài viết sử dụng',
        );
      }

      throw error;
    }
  }

  private async ensureNameAvailable(
    name: string,
    excludeId?: string,
  ) {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(category.name) = LOWER(:name)', { name });

    if (excludeId) {
      qb.andWhere('category.categoryId != :excludeId', {
        excludeId,
      });
    }

    if (await qb.getOne()) {
      throw new ConflictException('Tên danh mục đã tồn tại');
    }
  }

  private handleDatabaseError(error: unknown): never {
    const err = error as { code?: string };

    if (err.code === '23505') {
      throw new ConflictException('Tên danh mục đã tồn tại');
    }

    throw error;
  }
  
async getDashboardStats() {
  const total = await this.categoryRepository.count();

  return {
    total,
  };
}
}