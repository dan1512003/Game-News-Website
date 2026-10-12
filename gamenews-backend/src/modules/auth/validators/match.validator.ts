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
  name: 'Match',
  async: false,
})
export class MatchConstraint
  implements ValidatorConstraintInterface
{

  // ===================================================
  // VALIDATE
  // ===================================================

  validate(
    value: unknown,
    args: ValidationArguments,
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
    // Lấy property cần so sánh
    // -----------------------------------------------

    const [
      relatedPropertyName,
    ] = args.constraints as string[];


    const object =
      args.object as Record<
        string,
        unknown
      >;


    const relatedValue =
      object[relatedPropertyName];


    // -----------------------------------------------
    // Không được rỗng
    // -----------------------------------------------

    if (
      value.trim().length === 0
    ) {
      return false;
    }


    // -----------------------------------------------
    // Không được rỗng password
    // -----------------------------------------------

    if (
      typeof relatedValue !== 'string' ||
      relatedValue.length === 0
    ) {
      return false;
    }


    // -----------------------------------------------
    // SO SÁNH
    // -----------------------------------------------

    return (
      value === relatedValue
    );
  }


  // ===================================================
  // MESSAGE
  // ===================================================

  defaultMessage(
    args: ValidationArguments,
  ): string {

    const [
      relatedPropertyName,
    ] = args.constraints as string[];


    const object =
      args.object as Record<
        string,
        unknown
      >;


    const value =
      args.value;


    // -----------------------------------------------
    // EMPTY CONFIRM
    // -----------------------------------------------

    if (
      typeof value !== 'string' ||
      value.trim().length === 0
    ) {
      return 'Vui lòng xác nhận mật khẩu';
    }


    // -----------------------------------------------
    // PASSWORD EMPTY
    // -----------------------------------------------

    const relatedValue =
      object[relatedPropertyName];


    if (
      typeof relatedValue !== 'string' ||
      relatedValue.length === 0
    ) {
      return 'Vui lòng nhập mật khẩu trước';
    }


    // -----------------------------------------------
    // NOT MATCH
    // -----------------------------------------------

    return 'Mật khẩu xác nhận không khớp';
  }
}


// =====================================================
// DECORATOR
// =====================================================

export function Match(
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {

  return (
    object: object,
    propertyName: string | symbol,
  ) => {

    registerDecorator({

      name: 'Match',

      target:
        object.constructor,

      propertyName:
        propertyName.toString(),

      constraints: [
        property,
      ],

      options:
        validationOptions,

      validator:
        MatchConstraint,

    });

  };
}