
// import {
//   ArgumentMetadata,
//   Injectable,
//   PipeTransform,
// } from '@nestjs/common';

// @Injectable()
// export class ParseFormDataPipe implements PipeTransform {
//   transform(
//     value: unknown,
//     _metadata: ArgumentMetadata,
//   ): unknown {
//     if (!value || typeof value !== 'object') {
//       return value;
//     }

//     const body = value as Record<string, unknown>;

//     // Parse các trường JSON được gửi qua FormData.
//     const jsonFields = ['tagIds', 'contentBlocks'];

//     for (const field of jsonFields) {
//       const current = body[field];

//       if (typeof current === 'string') {
//         try {
//           body[field] = JSON.parse(current);
//         } catch {
//           // Giữ nguyên để ValidationPipe kiểm tra và báo lỗi.
//         }
//       }
//     }

//     // Chuyển các trường số.
//     const numberFields = [
//       'categoryId',
//       'views',
//       'reviewScore',
//     ];

//     for (const field of numberFields) {
//       const current = body[field];

//       if (
//         typeof current === 'string' &&
//         current.trim() !== ''
//       ) {
//         const parsed = Number(current);

//         if (Number.isFinite(parsed)) {
//           body[field] = parsed;
//         }
//       }
//     }

//     // Chuẩn hóa các trường ID dạng chuỗi.
//     // DTO hiện tại khai báo authorId/reviewerId là string.
//     for (const field of ['authorId', 'reviewerId']) {
//       if (body[field] === '') {
//         body[field] = undefined;
//       }
//     }

//     // Chuỗi rỗng ở trường ngày tùy chọn được coi là chưa nhập.
//     for (const field of ['publishedAt', 'scheduledAt']) {
//       if (body[field] === '') {
//         body[field] = undefined;
//       }
//     }

//     // Chuỗi rỗng ở các trường ghi chú tùy chọn.
//     for (const field of [
//       'summary',
//       'thumbnail',
//       'editorNote',
//       'requirementNote',
//     ]) {
//       if (body[field] === '') {
//         body[field] = undefined;
//       }
//     }

//     return body;
//   }
// }