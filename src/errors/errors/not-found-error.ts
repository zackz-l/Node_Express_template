import BaseError from './base-error';
import errorTypes from './error-types';

/**
 * NotFoundError - used when requested data not found.
 */
export default class NotFoundError extends BaseError {
  constructor(public code: string, message: string) {
    super(code, message);
    this.type = errorTypes.notFound;
  }
}
