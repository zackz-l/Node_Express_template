import { IAuthRepository } from "../aggregates/auth/auth-repository";
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

import { IUserRepository } from "../aggregates/users/user-repository";

@injectable()
export default class AuthService {
  constructor(
    @inject(TYPES.AuthRepository)
    private readonly authRepository: IAuthRepository,
    @inject(TYPES.TokenUtilities)
    private readonly tokenUtilities: ITokenUtilities,
    @inject(TYPES.EmailSender)
    private readonly emailSender: IEmailSender,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  public async login(
    email: string,
    password: string
  ): Promise<{ loginUser: LoginUser; sessionId: string }> {
    const userQuery: UserQuery = { email };
    const loginUser = await this.authRepository.getLoginUserByEmail(userQuery);

    if (!loginUser || !loginUser.checkPassword(password)) {
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `User with email: ${email} login failed.`
      );
    }

    const sessionId = await this.authRepository.createUserSession(loginUser.id);

    return { loginUser, sessionId };
  }

  public async signupUser(signupUser: SignupUser): Promise<string> {
    if (await this.validateEmailAndUsernameDuplication(signupUser)) {
      throw new ValidationError(
        ERROR_CODE.EMAIL_OR_USERNAME_ALREADY_EXISTS,
        `User trying to signup with email: ${signupUser.email} is already existed.`
      );
    }
    await signupUser.hashingPassword();
    const userId = await this.authRepository.signupUser(signupUser);
    const token = await this.tokenUtilities.generateEmailVerificationToken(
      userId
    );
    try {
      this.emailSender.sendUserVerificationEmail(signupUser.email, token);
    } catch (error) {
      throw new AuthenticationError(
        ERROR_CODE.EMAIL_FAIL_TO_SEND,
        `Email: ${signupUser.email} cannot receive verification link`
      );
    }
    return userId;
  }

  public async verifyEmail(token: string): Promise<string> {
    let userId: string;
    try {
      userId = await this.tokenUtilities.verifyEmailVerificationToken(token);
    } catch (err) {
      throw new AuthenticationError(
        ERROR_CODE.TOKEN_EXPIRATION,
        `JWT Token Expired.`
      );
    }
    const userQuery: UserQuery = { userId: userId };
    const loginUser = await this.userRepository.getUserById(userQuery);
    if (!loginUser) {
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `User trying to verify email with userId: ${userId} does not existed.`
      );
    }
    return this.authRepository.verifyEmail(userId);
  }
  public async authenticateUser(
    userId: string,
    sessionId: string
  ): Promise<string> {
    const userQuery: UserQuery = { userId: userId };

    const loginUser = await this.userRepository.getUserById(userQuery);

    if (!loginUser) {
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `User trying to authenticate with userId: ${userId} does not existed.`
      );
    }

    const authenticatedUser = await this.authRepository.authenticateUser(
      userId,
      sessionId
    );

    if (!authenticatedUser) {
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `User trying to authenticate with userId: ${userId} session not found.`
      );
    }

    return loginUser.id;
  }

  public validateEmailAndUsernameDuplication(
    signupUser: SignupUser
  ): Promise<boolean> {
    const signupUserQuery: UserQuery = {
      username: signupUser.username,
      email: signupUser.email,
    };
    return this.authRepository.findEmailAndUsernameDuplication(signupUserQuery);
  }

  public async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<string> {
    const userQuery: UserQuery = { userId: userId };
    const loginUser = await this.userRepository.getUserById(userQuery);
    if (loginUser) {
      loginUser.updatePassword(newPassword);
      return this.authRepository.updateUserPassword(loginUser);
    }

    throw new NotFoundError(
      ERROR_CODE.USER_DOES_NOT_EXIST,
      `User trying to update password with userId: ${userId} does not exist.`
    );
  }

  public async updateUsername(
    userId: string,
    username: string
  ): Promise<string> {
    const userQuery: UserQuery = { userId: userId };
    const loginUser = await this.userRepository.getUserById(userQuery);
    if (!loginUser) {
      throw new NotFoundError(
        ERROR_CODE.USER_DOES_NOT_EXIST,
        `User trying to update name with userId: ${userId} does not exist.`
      );
    }
    return this.authRepository.updateUsername(userId, username);
  }

  public async deleteUser(userId: string): Promise<string> {
    const userQuery: UserQuery = { userId: userId };
    const loginUser = await this.userRepository.getUserById(userQuery);
    if (loginUser) {
      const deleteUserID = await this.authRepository.deleteUser(loginUser);
      return deleteUserID;
    }
    throw new NotFoundError(
      ERROR_CODE.USER_NOT_FOUND,
      `Delete user with userId: ${userId} does not exist.`
    );
  }
}
