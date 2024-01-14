export default class ErrorResponse {
  constructor(private error: string, public httpStatusCode: number) {}

  public toJson() {
    return { error: this.error };
  }
}
