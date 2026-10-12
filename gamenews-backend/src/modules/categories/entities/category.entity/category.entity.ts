import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { NewsEntity } from '../../../news/entities/news.entity/news.entity.js';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn({
    name: 'category_id',
    type: 'bigint',
  })
  categoryId: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  // Category có nhiều News
@OneToMany(() => NewsEntity, (news) => news.category)
news: Relation<NewsEntity[]>;
}