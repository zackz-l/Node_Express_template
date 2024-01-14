import BaseError from './base-error';
import errorTypes from './error-types';

/**
 * InvalidInputError - used when the input format is invalid, or unrecognizable input.
 */
export default class InvalidInputError extends BaseError {
  constructor(public code: string, message: string) {
    super(code, message);
    this.type = errorTypes.invalidInputData;
  }
}
