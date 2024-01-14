import LoginUser from '../../../domain/aggregates/auth/login-user';

export default class GetUserResponse {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string
  ) {}

  static fromLoginUser(loginUser: LoginUser) {
    return new GetUserResponse(
      loginUser.id,
      loginUser.username,
      loginUser.email
    );
  }
}
