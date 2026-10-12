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
  name: 'IsEmailAddress',
  async: false,
})
export class IsEmailAddressConstraint
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

    const email =
      value.trim();

    if (!email) {
      return false;
    }


    // -----------------------------------------------
    // EMAIL FORMAT
    // -----------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
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
      return 'Vui lòng nhập email';
    }


    // -----------------------------------------------
    // INVALID EMAIL
    // -----------------------------------------------

    return 'Email không hợp lệ';
  }
}


// =====================================================
// DECORATOR
// =====================================================

export function IsEmailAddress(
  validationOptions?: ValidationOptions,
): PropertyDecorator {

  return (
    object: object,
    propertyName: string | symbol,
  ) => {

    registerDecorator({

      name: 'IsEmailAddress',

      target:
        object.constructor,

      propertyName:
        propertyName.toString(),

      options:
        validationOptions,

      validator:
        IsEmailAddressConstraint,

    });

  };
}