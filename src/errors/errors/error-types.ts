export default Object.freeze({
  // a we-know-nothing-about-this-error for things we didn't expect. Should only be used
  // in the final catch state of the app.
  genericError: 'GENERIC_ERROR',
  // an generic error that relates to url, resource or data not found.
  notFound: 'NOT_FOUND',

  JSONParseError: 'JSON_PARSE_ERROR',

  // general errors
  invalidInputData: 'INVALID_INPUT_DATA',
  networkError: 'NETWORK_ERROR',
  unauthenticated: 'UNAUTHENTICATED',
  unauthorized: 'UNAUTHORIZED',
  internalServerError: 'INTERNAL_SERVER_ERROR',
  missingOrInvalidHTTPHeader: 'MISSING_OR_INVALID_HTTP_HEADER',
  dependencyError: 'DEPENDENCY_ERROR',
  requestTimeOut: 'REQUEST_TIMEOUT',

  // business logic related errors
  requestDataNotFound: 'REQUEST_DATA_NOT_FOUND',
  validationFailure: 'VALIDATION_FAILURE',
  dataStateConflict: 'DATA_STATE_CONFILCT',
  userDataConflict: 'USER_DATA_CONFLICT',
  pageNumberLessThanZero: 'PAGE_NUMBER_LESS_THAN_ZERO',
  pageSizeLessThanOne: 'PAGE_SIZE_LESS_THAN_ONE'
});
