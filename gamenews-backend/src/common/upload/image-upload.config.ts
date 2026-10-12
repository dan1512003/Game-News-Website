
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

export type ImageUploadFolder = 'news' | 'avatars';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export function createImageUploadOptions(
  folder: ImageUploadFolder,
  multiple = false,
) {
  const uploadDir = join(
    process.cwd(),
    'uploads',
    folder,
  );

  return {
    storage: diskStorage({
      destination: (
        _req: Request,
        _file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void,
      ) => {
        mkdirSync(uploadDir, { recursive: true });
        callback(null, uploadDir);
      },

      filename: (
        _req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) => {
        const extension = extname(file.originalname).toLowerCase();
        callback(null, `${randomUUID()}${extension}`);
      },
    }),

    limits: {
      fileSize: MAX_FILE_SIZE,
      files: multiple ? 20 : 1,
    },

    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            'Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF',
          ),
          false,
        );
      }

      callback(null, true);
    },
  };
}