import { IAuthRepository } from '../aggregates/auth/auth-repository';
import LoginUser from '../aggregates/auth/login-user';
import SignupUser from '../aggregates/auth/signup-user';
import { UserQuery } from '../aggregates/auth/user-query';
import { ProviderQuery } from '../aggregates/auth/provider-query';
import TYPES from '../constants/types';
import {
  AuthenticationError,
  ValidationError,
  ERROR_CODE
} from '../../errors/index';
import { inject, injectable } from 'inversify';
import { NotFoundError } from '../../errors';
import { BaseError } from '../../errors';
import { ITokenUtilities } from '../contracts/token-utilities';
import { IEmailSender } from '../contracts/email-sender';
import FollowingStatus from '../aggregates/auth/following-status';
import { PostQuery } from '../aggregates/articles/article-query';
import { PostStatus } from '@prisma/client';
import Post from '../aggregates/articles/article';
import { IUserRepository } from '../aggregates/users/user-repository';

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
      email: signupUser.email
    };
    return this.authRepository.foundEmailAndUsernameDuplication(
      signupUserQuery
    );
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

  public async providerLogin(email: string): Promise<string> {
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    const userName =
      Math.floor(100000 + Math.random() * 900000).toString() + 'User';
    const providerQuery: ProviderQuery = { email, passcode, userName };
    let providerId: string | undefined;
    providerId = await this.authRepository.getProviderByEmail(providerQuery);
    if (!providerId) {
      providerId = await this.authRepository.createProvider(providerQuery);
    }

    // if (await this.authRepository.getProviderPasscode(providerQuery)) {
    //   await this.authRepository.deleteProviderPasscode(email);
    // }

    const providerPasscode = await this.authRepository.updateProviderPasscode(
      email,
      passcode
    );
    this.emailSender.sendProviderPasscodeEmail(email, providerPasscode);
    return providerId;
  }

  public async verifyPasscode(
    email: string,
    passcode: string
  ): Promise<{ providerId: string; providerSessionId: string }> {
    const providerQuery: ProviderQuery = { email };
    const providerId = await this.authRepository.getProviderByEmail(
      providerQuery
    );
    if (!providerId) {
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `Provider trying to verify passcode with email: ${email} does not exist.`
      );
    }

    const verifiedPasscode = await this.authRepository.verifyPasscode(
      email,
      passcode
    );
    if (!verifiedPasscode) {
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `Failed to verify the provider with the email ${email} as the passcode entered does not match.`
      );
    }
    // const deletedPasscode = await this.authRepository.deleteProviderPasscode(
    //   email
    // );
    const providerSessionId = await this.authRepository.createProviderSession(
      providerId
    );
    return { providerId, providerSessionId };
  }

  public async followUser(
    userId: string,
    followingUserId: string
  ): Promise<string> {
    /*Check if both user appear in the followingstatus table
      user has following(who user follow) and follower(who follows user)*/
    const userExist = await this.userRepository.userExist(userId);
    if (userId === followingUserId) {
      throw new ValidationError(
        ERROR_CODE.CANNOT_FOLLOW_OR_UNFOLLOW_YOURSELF,
        `You can not follow yourself`
      );
    }
    const followingUserExist = await this.userRepository.userExist(
      followingUserId
    );
    /// the followingUserId does not appear in the table///
    if (!followingUserExist) {
      await this.userRepository.createFollowerTable(followingUserId, userId);
    } else {
      /// the following user appear in the table///
      var followerData = await this.userRepository.queryFollowingData(
        followingUserId
      );
      if (followerData.followerId.includes(userId)) {
        throw new NotFoundError(
          ERROR_CODE.ALREADY_FOLLOWED,
          `You already followed this user with userId: ${userId}`
        );
      }
      /// push the userId into the follwerId array of FollowingUserId///
      followerData.followerId.push(userId);
      await this.userRepository.updateFollowerTable(
        followingUserId,
        followerData.followerId
      );
    }
    /// the userId does not appear in the table///
    if (!userExist) {
      return await this.userRepository.createFollowingTable(
        userId,
        followingUserId
      );
    }
    var followingData = await this.userRepository.queryFollowingData(userId);
    followingData.followingId.push(followingUserId);
    return await this.userRepository.updateFollowingTable(
      userId,
      followingData.followingId
    );
  }

  public async unfollowUser(
    userId: string,
    unfollowUserId: string
  ): Promise<string> {
    if (userId === unfollowUserId) {
      throw new ValidationError(
        ERROR_CODE.CANNOT_FOLLOW_OR_UNFOLLOW_YOURSELF,
        `You can not unfollow yourself`
      );
    }
    var followingData = await this.userRepository.queryFollowingData(userId);
    ///remove unfollowUserId from userId's followingId array///
    followingData.followingId = followingData.followingId.filter(
      (userId) => userId !== unfollowUserId
    );
    const id = await this.userRepository.updateFollowingTable(
      userId,
      followingData.followingId
    );
    var followerData = await this.userRepository.queryFollowingData(
      unfollowUserId
    );
    followerData.followerId = followerData.followerId.filter(
      (followerId) => followerId !== userId
    );
    await this.userRepository.updateFollowerTable(
      unfollowUserId,
      followerData.followerId
    );
    return id;
  }
}
