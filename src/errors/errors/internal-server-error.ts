import BaseError from './base-error';
import errorTypes from './error-types';

/**
 * InternalServerError - used for generic server error. Should avoid
 * using this unless there is no other Error appropriate.
 */
export default class InternalServerError extends BaseError {
  constructor(public code: string, message: string) {
    super(code, message);
    this.type = errorTypes.internalServerError;
  }
}
