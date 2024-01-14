import BaseError from './base-error';
import errorTypes from './error-types';

/**
 * AuthorizationError - used when the user has no permission
 * to access data (even successfully authenticated.)
 */
export default class AuthorizationError extends BaseError {
  constructor(public code: string, message: string) {
    super(code, message);
    this.type = errorTypes.unauthorized;
  }
}
