import { ValidationError, validate } from 'class-validator';
import { ERROR_CODE, InvalidInputError } from '../../errors';

export abstract class APIRequest {
  public async validate() {
    const errors: ValidationError[] = await validate(this, {
      skipMissingProperties: true
    });

    if (errors.length === 0) {
      return this;
    }

    throw new InvalidInputError(ERROR_CODE.INVALID_REQUEST, errors.toString());
  }
}
