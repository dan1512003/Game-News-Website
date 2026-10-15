
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { IsUsername } from '../../../auth/validators/is-username.validator.js';

export class UpdateUsernameDto {
  @IsNotEmpty({ message: 'User ID không được để trống' })
  @IsString({ message: 'User ID phải là chuỗi' })
  userId: string;
 @IsUsername()
  username: string;
}

