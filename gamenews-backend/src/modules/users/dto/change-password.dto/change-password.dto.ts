
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { IsStrongPassword } from '../../../auth/validators/is-strong-password.validator.js';
import { Match } from '../../../auth/validators/match.validator.js';

@ValidatorConstraint({
  name: 'passwordsMatch',
  async: false,
})
class PasswordsMatchConstraint
  implements ValidatorConstraintInterface
{
  validate(confirmPassword: string, args: ValidationArguments) {
    const object = args.object as ChangePasswordDto;

    return confirmPassword === object.newPassword;
  }

  defaultMessage() {
    return 'Mật khẩu xác nhận không khớp';
  }
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'User ID không được để trống' })
  @IsString({ message: 'User ID phải là chuỗi' })
  userId: string;

  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString()
  currentPassword: string;
  
  @IsStrongPassword()
  newPassword: string;

  @Match('newPassword')
  confirmPassword: string;
}

