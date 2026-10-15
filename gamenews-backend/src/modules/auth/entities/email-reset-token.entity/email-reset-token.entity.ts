
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { UserEntity } from '../../../users/entities/user.entity/user.entity.js';

@Entity('email_reset_tokens')
export class EmailResetTokenEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: string;

  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId: string;

  @Column({
    name: 'otp_hash',
    type: 'varchar',
    length: 255,
  })
  otpHash: string;
  
  @Column({

    type: 'varchar',

    length: 255,

  })

  email: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt: Date;

  @Column({
    type: 'integer',
    default: 0,
  })
  attempts: number;

  // =========================================
  // SESSION ID CHO TỪNG LẦN ĐỔI EMAIL
  // =========================================

  @Column({
    name: 'session_id',
    type: 'uuid',
  })
  sessionId: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt: Date;

  // OTP thuộc về một user
  @ManyToOne(
    () => UserEntity,
    (user) => user.emailResetTokens,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user: Relation<UserEntity>;
}