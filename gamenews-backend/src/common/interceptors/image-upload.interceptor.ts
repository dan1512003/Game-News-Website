
import {
  FileInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';

import {
  createImageUploadOptions,
  ImageUploadFolder,
} from '../upload/image-upload.config.js';

export function ImageUploadInterceptor(
  folder: ImageUploadFolder,
) {
  return FileInterceptor(
    'file',
    createImageUploadOptions(folder),
  );
}

export function NewsImagesUploadInterceptor() {
  return AnyFilesInterceptor(
    createImageUploadOptions('news', true),
  );
}