import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { NewsEntity } from '../../../news/entities/news.entity/news.entity.js';
import { CommentEntity } from '../../../comments/entities/comment.entity/comment.entity.js';
import { RefreshTokenEntity } from '../../../auth/entities/refresh-token.entity/refresh-token.entity.js';
import { EmailResetTokenEntity } from '../../../auth/entities/email-reset-token.entity/email-reset-token.entity.js';
import { PasswordResetTokenEntity } from '../../../auth/entities/password-reset-token.entity/password-reset-token.entity.js';



@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  username: string;

  /**
   * Email KHÔNG unique trực tiếp.
   *
   * Vì user chưa xác thực email có thể tạm thời
   * dùng cùng email với một registration khác.
   *
   * PostgreSQL sẽ xử lý unique email thông qua
   * partial unique index:
   *
   * users_verified_email_unique
   */
  @Column({
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'text',
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'user',
  })
  role: string;

  /**
   * Trạng thái tài khoản:
   *
   * pending_verification
   * active
   * banned
   */
  @Column({
    type: 'varchar',
    length: 30,
    default: 'pending_verification',
  })
  status: string;

  /**
   * Hash của verification token.
   *
   * KHÔNG lưu token gốc vào database.
   */
  @Column({
    name: 'verification_token_hash',
    type: 'text',
    nullable: true,
  })
  verificationTokenHash: string | null;

  /**
   * Thời điểm verification token hết hạn.
   */
  @Column({
    name: 'verification_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  verificationExpiresAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;

  // User tạo bài viết
  @OneToMany(() => NewsEntity, (news) => news.author)
  authoredNews: Relation<NewsEntity>[];

  // User review bài viết
  @OneToMany(() => NewsEntity, (news) => news.reviewer)
  reviewedNews: Relation<NewsEntity>[];

  // User viết comment
  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: Relation<CommentEntity>[];

  // User có nhiều refresh token
  @OneToMany(
    () => RefreshTokenEntity,
    (refreshToken) => refreshToken.user,
  )
  refreshTokens: Relation<RefreshTokenEntity>[];

    // User có nhiều OTP reset email
  @OneToMany(
    () => EmailResetTokenEntity,
    (emailResetToken) => emailResetToken.user,
  )
  emailResetTokens: Relation<EmailResetTokenEntity>[];
@OneToMany(
  () => PasswordResetTokenEntity,
  (token) => token.user,
)
passwordResetTokens: Relation<PasswordResetTokenEntity[]>;
}
