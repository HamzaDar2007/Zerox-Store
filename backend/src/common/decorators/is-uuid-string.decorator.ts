import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom UUID validator that accepts any UUID-formatted hex string.
 * The standard @IsUUID() from class-validator requires version 1-8 in position 13,
 * but our database uses non-standard UUIDs (e.g., 10000000-0000-0000-0000-000000000003).
 */
export function IsUuidString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUuidString',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must be a UUID`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            value,
          );
        },
      },
    });
  };
}
