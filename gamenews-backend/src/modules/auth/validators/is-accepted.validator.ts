import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function IsAccepted(
  validationOptions?: ValidationOptions,
) {
  return function (
    object: object,
    propertyName: string,
  ) {
    registerDecorator({
      name: 'isAccepted',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return value === true;
        },
      },
    });
  };
}
