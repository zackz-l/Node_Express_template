export default class BaseError extends Error {
  constructor(
    public code: string,
    public message: string,
    public type?: string
  ) {
    super(`Error code: ${code} message: ${message}`);
  }

  // field is named message to respect Error, but we decide to name
  // it data to communicate with users of our error classes, so that
  // they use this to understand the context of the error, not to
  // display to the end user.

  getType(): string | undefined {
    return this.type;
  }
}
