import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';


// =====================================================
// CONSTRAINT
// =====================================================

@ValidatorConstraint({
  name: 'IsUsername',
  async: false,
})
export class IsUsernameConstraint
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
      value.trim().length === 0
    ) {
      return false;
    }


    // -----------------------------------------------
    // Độ dài 3 - 50
    // -----------------------------------------------

    if (
      value.trim().length < 3 ||
      value.trim().length > 50
    ) {
      return false;
    }


    return true;
  }


  // ===================================================
  // MESSAGE
  // ===================================================

  defaultMessage(
    args: ValidationArguments,
  ): string {

    const value =
      args.value;


    // -----------------------------------------------
    // EMPTY
    // -----------------------------------------------

    if (
      typeof value !== 'string' ||
      value.trim().length === 0
    ) {
      return 'Vui lòng nhập tên người dùng';
    }


    // -----------------------------------------------
    // INVALID LENGTH
    // -----------------------------------------------

    return 'Username phải từ 3 đến 50 ký tự';
  }
}


// =====================================================
// DECORATOR
// =====================================================

export function IsUsername(
  validationOptions?: ValidationOptions,
): PropertyDecorator {

  return (
    object: object,
    propertyName: string | symbol,
  ) => {

    registerDecorator({

      name: 'IsUsername',

      target:
        object.constructor,

      propertyName:
        propertyName.toString(),

      options:
        validationOptions,

      validator:
        IsUsernameConstraint,

    });

  };
}