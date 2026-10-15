import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import {
  createObserveModule,
} from '@nestjs/observe';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  AppController,
} from './app.controller.js';

import {
  AppService,
} from './app.service.js';


// =====================================================
// MODULES
// =====================================================

import {
  UsersModule,
} from './modules/users/users.module.js';

import {
  CategoriesModule,
} from './modules/categories/categories.module.js';

import {
  TagsModule,
} from './modules/tags/tags.module.js';

import {
  NewsModule,
} from './modules/news/news.module.js';

import {
  ContentBlocksModule,
} from './modules/content-blocks/content-blocks.module.js';

import {
  CommentsModule,
} from './modules/comments/comments.module.js';

import {
  NewsTagsModule,
} from './modules/news-tags/news-tags.module.js';

import {
  AuthModule,
} from './modules/auth/auth.module.js';

import {
  MailModule,
} from './modules/mail/mail.module.js';


// =====================================================
// ENTITIES
// =====================================================

import {
  UserEntity,
} from './modules/users/entities/user.entity/user.entity.js';

import {
  CategoryEntity,
} from './modules/categories/entities/category.entity/category.entity.js';

import {
  TagEntity,
} from './modules/tags/entities/tag.entity/tag.entity.js';

import {
  NewsEntity,
} from './modules/news/entities/news.entity/news.entity.js';

import {
  CommentEntity,
} from './modules/comments/entities/comment.entity/comment.entity.js';

import {
  ContentBlockEntity,
} from './modules/content-blocks/entities/content-block.entity/content-block.entity.js';

import {
  NewsTagEntity,
} from './modules/news-tags/entities/news-tag.entity/news-tag.entity.js';

import {
  RefreshTokenEntity,
} from './modules/auth/entities/refresh-token.entity/refresh-token.entity.js';


// =====================================================
// CONFIG
// =====================================================

import configuration from './config/configuration.js';


// =====================================================
// MIDDLEWARE
// =====================================================

import {
  CorsMiddleware,
} from './common/middleware/cors.middleware.js';

import {
  CookieParserMiddleware,
} from './common/middleware/cookie-parser.middleware.js';
import { PasswordResetTokenEntity } from './modules/auth/entities/password-reset-token.entity/password-reset-token.entity.js';
import { EmailResetTokenEntity } from './modules/auth/entities/email-reset-token.entity/email-reset-token.entity.js';
import { AccessTokenBlacklistEntity } from './modules/auth/entities/access-token-blacklist.entity/access-token-blacklist.entity.js';


// =====================================================
// OBSERVE
// =====================================================

export const {
  ObserveModule,
  ObserveInstrument,
} =
  createObserveModule();


@Module({

  imports: [

    // ===================================================
    // CONFIG
    // ===================================================

    ConfigModule.forRoot({

      isGlobal: true,

      load: [
        configuration,
      ],

    }),


    // ===================================================
    // DATABASE
    // ===================================================

    TypeOrmModule.forRootAsync({

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => ({

        type:
          'postgres' as const,


        host:
          configService.get<string>(
            'database.host',
            'localhost',
          ),


        port:
          configService.get<number>(
            'database.port',
            5432,
          ),


        username:
          configService.get<string>(
            'database.username',
            'postgres',
          ),


        password:
          configService.get<string>(
            'database.password',
            '',
          ),


        database:
          configService.get<string>(
            'database.name',
            'game_news',
          ),


        entities: [

          UserEntity,

          CategoryEntity,

          TagEntity,

          NewsEntity,

          CommentEntity,

          ContentBlockEntity,

          NewsTagEntity,

          RefreshTokenEntity,
            EmailResetTokenEntity,
            PasswordResetTokenEntity,
          AccessTokenBlacklistEntity,

        ],


        synchronize:
          false,


        logging:
          false,

      }),

    }),


    // ===================================================
    // MODULES
    // ===================================================

    UsersModule,

    CategoriesModule,

    TagsModule,

    NewsModule,

    ContentBlocksModule,

    CommentsModule,

    NewsTagsModule,

    AuthModule,

    MailModule,

  ],


  // =====================================================
  // CONTROLLERS
  // =====================================================

  controllers: [
    AppController,
  ],


  // =====================================================
  // PROVIDERS
  // =====================================================

  providers: [
    AppService,
  ],

})


export class AppModule
  implements NestModule {


  configure(
    consumer: MiddlewareConsumer,
  ) {

    consumer

      // =================================================
      // COOKIE PARSER
      // =================================================

      .apply(
        CookieParserMiddleware,
        CorsMiddleware,
      )

      .forRoutes('*');

  }

}