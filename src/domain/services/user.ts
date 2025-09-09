import { IUserRepository } from "../aggregates/users/user-repository";
import LoginUser from "../aggregates/auth/login-user";
import SignupUser from "../aggregates/auth/signup-user";
import { UserQuery } from "../aggregates/auth/user-query";
import { ProviderQuery } from "../aggregates/auth/provider-query";
import TYPES from "../constants/types";
import {
  AuthenticationError,
  ValidationError,
  ERROR_CODE,
} from "../../errors/index";
import { inject, injectable } from "inversify";
import { NotFoundError } from "../../errors";
import { BaseError } from "../../errors";
import { ITokenUtilities } from "../contracts/token-utilities";
import { IEmailSender } from "../contracts/email-sender";
import FollowingStatus from "../aggregates/auth/following-status";

@injectable()
export default class UserService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  public async getUserByUsername(username: string): Promise<LoginUser> {
    const userQuery: UserQuery = { username: username };
    const loginUser = await this.userRepository.getUserByUsername(userQuery);
    if (!loginUser) {
      throw new NotFoundError(
        ERROR_CODE.USER_DOES_NOT_EXIST,
        `User with username: ${username} does not exist.`
      );
    }
    return loginUser;
  }

  public async getUserById(userId: string): Promise<LoginUser> {
    const userQuery: UserQuery = { userId: userId };
    const loginUser = await this.userRepository.getUserById(userQuery);
    if (!loginUser) {
      throw new NotFoundError(
        ERROR_CODE.USER_DOES_NOT_EXIST,
        `User with Id: ${userId} does not exist.`
      );
    }
    return loginUser;
  }
}
