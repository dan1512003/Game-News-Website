import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';


// =====================================================
// VALIDATOR CONSTRAINT
// =====================================================

@ValidatorConstraint({
  name: 'IsStrongPassword',
  async: false,
})
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{

  // ===================================================
  // VALIDATE
  // ===================================================

  validate(
    value: unknown,
    _args: ValidationArguments,
  ): boolean {

    // -----------------------------------------------
    // Phải là string
    // -----------------------------------------------

    if (
      typeof value !== 'string'
    ) {
      return false;
    }


    // -----------------------------------------------
    // Không được rỗng
    // -----------------------------------------------

    if (
      value.length === 0
    ) {
      return false;
    }


    // -----------------------------------------------
    // Độ dài 8 - 100
    // -----------------------------------------------

    if (
      value.length < 8 ||
      value.length > 100
    ) {
      return false;
    }


    // -----------------------------------------------
    // Chữ thường
    // -----------------------------------------------

    if (
      !/[a-z]/.test(value)
    ) {
      return false;
    }


    // -----------------------------------------------
    // Chữ hoa
    // -----------------------------------------------

    if (
      !/[A-Z]/.test(value)
    ) {
      return false;
    }


    // -----------------------------------------------
    // Số
    // -----------------------------------------------

    if (
      !/\d/.test(value)
    ) {
      return false;
    }


    // -----------------------------------------------
    // Ký tự đặc biệt
    // -----------------------------------------------

    if (
      !/[^A-Za-z0-9]/.test(value)
    ) {
      return false;
    }


    // -----------------------------------------------
    // Hợp lệ
    // -----------------------------------------------

    return true;
  }


  // ===================================================
  // DEFAULT MESSAGE
  // ===================================================

  defaultMessage(
    args: ValidationArguments,
  ): string {

    const value =
      args.value;


    // -----------------------------------------------
    // Rỗng
    // -----------------------------------------------

    if (
      typeof value !== 'string' ||
      value.length === 0
    ) {

      return 'Vui lòng nhập mật khẩu';
    }


    // -----------------------------------------------
    // Tất cả lỗi password
    // dùng chung một message
    // -----------------------------------------------

    return (
      'Password phải từ 8 đến 100 ký tự, ' +
      'có chữ hoa, chữ thường, số và ký tự đặc biệt'
    );
  }
}


// =====================================================
// DECORATOR
// =====================================================

export function IsStrongPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {

  return (
    object: object,
    propertyName: string | symbol,
  ) => {

    registerDecorator({

      name: 'IsStrongPassword',

      target:
        object.constructor,

      propertyName:
        propertyName.toString(),

      options:
        validationOptions,

      validator:
        IsStrongPasswordConstraint,

    });

  };
}