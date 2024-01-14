import BaseError from './base-error';
import errorTypes from './error-types';

/**
 * JSONParsingError - used when the json body cannot be parsed.
 */
export default class JSONParsingError extends BaseError {
  constructor(public code: string, message: string) {
    super(code, message);
    this.type = errorTypes.JSONParseError;
  }
}
