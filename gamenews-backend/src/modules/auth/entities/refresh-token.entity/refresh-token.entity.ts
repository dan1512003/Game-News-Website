import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { UserEntity } from '../../../users/entities/user.entity/user.entity.js';


@Entity('refresh_tokens')

@Index(['userId'])

@Index(['jti'], {
  unique: true,
})

@Index(['familyId'])
export class RefreshTokenEntity {

  // =====================================================
  // PRIMARY KEY
  // =====================================================

  @PrimaryGeneratedColumn('uuid')
  id: string;


  // =====================================================
  // USER
  // =====================================================

  // users.user_id = BIGINT
  // nên refresh_tokens.user_id cũng phải là BIGINT
  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId: string;


  // =====================================================
  // JWT ID
  // =====================================================

  // JTI duy nhất cho từng refresh token
  @Column({
    type: 'uuid',
  })
  jti: string;


  // =====================================================
  // REFRESH TOKEN HASH
  // =====================================================

  // SHA-256 hash của refresh token
  @Column({
    name: 'token_hash',
    type: 'text',
  })
  tokenHash: string;


  // =====================================================
  // TOKEN FAMILY
  // =====================================================

  // Một family đại diện cho một phiên đăng nhập / thiết bị.
  //
  // Khi rotate refresh token:
  //
  // token A
  //   ↓
  // token B
  //   ↓
  // token C
  //
  // A, B, C có cùng familyId.
  @Column({
    name: 'family_id',
    type: 'uuid',
  })
  familyId: string;


  // =====================================================
  // DEVICE
  // =====================================================

  @Column({
    name: 'device_name',
    type: 'text',
    nullable: true,
  })
  deviceName: string | null;


  // =====================================================
  // IP
  // =====================================================

  @Column({
    name: 'device_ip',
    type: 'inet',
    nullable: true,
  })
  deviceIp: string | null;


  // =====================================================
  // EXPIRATION
  // =====================================================

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt: Date;


  // =====================================================
  // REVOKED
  // =====================================================

  // null = token còn hiệu lực
  // có giá trị = token đã bị revoke
  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt: Date | null;


  // =====================================================
  // CREATED
  // =====================================================

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt: Date;


  // =====================================================
  // RELATIONSHIP
  // =====================================================

  @ManyToOne(
    () => UserEntity,
    (user) => user.refreshTokens,
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