import BaseError from './base-error';
import errorTypes from './error-types';

/**
 * ValidationError - used when business logic validation failed.
 */
export default class ValidationError extends BaseError {
  constructor(public code: string, message: string) {
    super(code, message);
    this.type = errorTypes.validationFailure;
  }
}
