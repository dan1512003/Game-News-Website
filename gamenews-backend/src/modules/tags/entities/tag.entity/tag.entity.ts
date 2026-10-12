import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { NewsTagEntity } from '../../../news-tags/entities/news-tag.entity/news-tag.entity.js';

@Entity('tags')
export class TagEntity {
  @PrimaryGeneratedColumn({
    name: 'tag_id',
    type: 'bigint',
  })
  tagId: string;

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

  // Tag được sử dụng trong nhiều News
  @OneToMany(() => NewsTagEntity, (newsTag) => newsTag.tag)
  newsTags: Relation<NewsTagEntity>[];
}