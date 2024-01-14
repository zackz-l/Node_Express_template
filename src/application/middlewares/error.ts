import { Response, Request, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../../infrastructure/log/logger';
import ErrorResponse from '../api-models/error-response';
import { BaseError, ERROR_CODE, errorTypes } from '../../errors';

const error = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  const errorResponse = handleError(error as BaseError);
  logger.error(`Error while processing request for ${request.path}`, error);
  response.status(errorResponse.httpStatusCode).json(errorResponse.toJson());
};

const handleError = (error: BaseError): ErrorResponse => {
  if (!error.getType) {
    return new ErrorResponse(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
  if (error.getType() === errorTypes.dataStateConflict) {
    return new ErrorResponse(error.code, StatusCodes.CONFLICT);
  } else if (
    error.getType() === errorTypes.invalidInputData ||
    error.getType() === errorTypes.validationFailure
  ) {
    return new ErrorResponse(error.code, StatusCodes.BAD_REQUEST);
  } else if (error.getType() === errorTypes.unauthenticated) {
    return new ErrorResponse(error.code, StatusCodes.FORBIDDEN);
  } else if (error.getType() === errorTypes.unauthorized) {
    return new ErrorResponse(error.code, StatusCodes.UNAUTHORIZED);
  } else if (error.getType() === errorTypes.notFound) {
    return new ErrorResponse(error.code, StatusCodes.NOT_FOUND);
  } else if (error.getType() === errorTypes.dependencyError) {
    return new ErrorResponse(error.code, StatusCodes.FAILED_DEPENDENCY);
  } else if (error.getType() === errorTypes.requestTimeOut) {
    return new ErrorResponse(error.code, StatusCodes.REQUEST_TIMEOUT);
  } else if (error.getType() === errorTypes.JSONParseError) {
    return new ErrorResponse(error.code, StatusCodes.BAD_REQUEST);
  } else {
    return new ErrorResponse(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export default error;
