import BaseError from './base-error';
import errorTypes from './error-types';

/**
 * AuthenticationError - used when the user's security check is failed.
 */
export default class AuthenticationError extends BaseError {
  constructor(public code: string, message: string) {
    super(code, message);
    this.type = errorTypes.unauthenticated;
  }
}
