import 'jest';
import 'reflect-metadata';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { instance, mock, when, deepEqual } from 'ts-mockito';

import { IAuthRepository } from '../aggregates/auth/auth-repository';
import LoginUser from '../aggregates/auth/login-user';
import { UserQuery } from '../aggregates/auth/user-query';
import SignupUser from '../aggregates/auth/signup-user';
import FollowingStatus from '../aggregates/auth/following-status';
import { ITokenUtilities } from '../contracts/token-utilities';

import AuthService from './auth';
import { userTestingData } from '../../test';
import { postTestingData } from '../../test';
import { ERROR_CODE, NotFoundError, AuthenticationError } from '../../errors';
import EmailSender from 'src/infrastructure/email-sender/email-sender';
import { IEmailSender } from '../contracts/email-sender';
import { ProviderQuery } from '../aggregates/auth/provider-query';
import { Token } from 'aws-sdk';
import { verify } from 'crypto';
import { PostQuery } from '../aggregates/articles/article-query';
import { PostStatus } from '@prisma/client';
import Post from '../aggregates/articles/article';
import UserService from './user';
import UserRepository from '../../infrastructure/repositories/user';
import { IUserRepository } from '../aggregates/users/user-repository';

chai.use(chaiAsPromised);

describe(UserService, () => {
  let userService: UserService,
    authRepository: IAuthRepository,
    jwtToken: ITokenUtilities,
    emailSender: IEmailSender;
  let username: string,
    email: string,
    password: string,
    userId: string,
    wrongPassword: string,
    newPassword: string,
    sessionId: string,
    newName: string;
  let title: string, content: string, postId: string;
  let postCount: number;
  let loginQuery: UserQuery;
  let updateUserQuery: UserQuery;
  let userQuery: UserQuery;
  let postDraftQuery: PostQuery;
  let loginUser: LoginUser;
  let signupUser: SignupUser;
  let findUserByIDQuery: UserQuery;
  let getUserByUsernameQuery: UserQuery;
  let getUserByIdQuery: UserQuery;
  let providerQuery: ProviderQuery;
  let post: Post;
  let providerId: string;
  let providerSessionId: string;
  let providerPasscode: string;
  let userToken: string;
  let followingUserId: string;
  let followingData: FollowingStatus;
  let userFollowingData: FollowingStatus;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = mock<IUserRepository>();
    jwtToken = mock<ITokenUtilities>();
    emailSender = mock<IEmailSender>();
    userService = new UserService(instance(userRepository));

    username = userTestingData.username;
    email = userTestingData.email;
    password = userTestingData.password;
    newPassword = userTestingData.newPassword;
    userId = userTestingData.userId;
    sessionId = userTestingData.sessionId;
    newName = userTestingData.newName;
    postCount = userTestingData.postCount;
    providerId = userTestingData.providerId;
    providerSessionId = userTestingData.providerSessionId;
    providerPasscode = userTestingData.providerPasscode;
    userToken = userTestingData.userToken;
    followingUserId = userTestingData.followedUserId;
    postId = postTestingData.postId;
    title = postTestingData.title;
    content = postTestingData.content;
    loginQuery = { email };
    userQuery = { username, email };
    getUserByUsernameQuery = { username };
    getUserByIdQuery = { userId: userId };
    updateUserQuery = { userId: userId };
    findUserByIDQuery = { userId: userId };
    providerQuery = { email: email };
    userFollowingData = {
      userId,
      followingId: ['111', '222', '333', '444'],
      followerId: ['555', '666', '777', '888']
    };
    followingData = {
      userId: followingUserId,
      followingId: [],
      followerId: []
    };

    loginUser = new LoginUser(username, email, password, userId);
    loginUser.updatePassword(password);
    signupUser = new SignupUser(username, email, password);
    postDraftQuery = { userId: userId, status: PostStatus.DRAFT };
    post = new Post(title, content, userId, postId);
  });
  describe('GetUserByUsername', () => {
    test('should successfully find the user with id, username, email, password, given the username', async () => {
      when(
        userRepository.getUserByUsername(deepEqual(getUserByUsernameQuery))
      ).thenResolve(loginUser);

      const actual = await userService.getUserByUsername(username);

      expect(loginUser).to.equal(actual);
    });

    test('should failed to find the user when user does not exist', async () => {
      when(
        userRepository.getUserByUsername(deepEqual(getUserByUsernameQuery))
      ).thenResolve(undefined);
      const promise = userService.getUserByUsername(username);
      await expect(promise)
        .to.be.rejectedWith(NotFoundError)
        .and.eventually.have.property('code')
        .to.eq(ERROR_CODE.USER_DOES_NOT_EXIST);
    });
  });

  describe('GetUserByid', () => {
    test('should successfully find the user with id, username, email, password, given the username', async () => {
      when(userRepository.getUserById(deepEqual(getUserByIdQuery))).thenResolve(
        loginUser
      );

      const actual = await userService.getUserById(userId);

      expect(loginUser).to.equal(actual);
    });

    test('shoulds failed to find the user when user does not exist', async () => {
      when(userRepository.getUserById(deepEqual(getUserByIdQuery))).thenResolve(
        undefined
      );
      const promise = userService.getUserById(userId);
      await expect(promise)
        .to.be.rejectedWith(NotFoundError)
        .and.eventually.have.property('code')
        .to.eq(ERROR_CODE.USER_DOES_NOT_EXIST);
    });
  });

  describe('GetPostNumber', () => {
    test('should successfully get the number of post of user with userid', async () => {
      when(userRepository.getUserById(deepEqual(updateUserQuery))).thenResolve(
        loginUser
      );
      when(userRepository.getPostNumber(loginUser)).thenResolve(postCount);
      const actual = await userService.getPostNumber(loginUser.id);
      expect(postCount).to.equal(actual);
    });

    test('should fail get users" post count when user does not exist', async () => {
      when(userRepository.getUserById(deepEqual(updateUserQuery))).thenResolve(
        undefined
      );
      const promise = userService.getPostNumber(loginUser.id);
      await expect(promise)
        .to.be.rejectedWith(NotFoundError)
        .and.eventually.have.property('code')
        .to.eq(ERROR_CODE.USER_DOES_NOT_EXIST);
    });
  });

  describe('Get Following Count of a user', () => {
    test('should return the correct following count', async () => {
      when(userRepository.userExist(userId)).thenResolve(userId);
      when(userRepository.queryFollowingData(deepEqual(userId))).thenResolve(
        userFollowingData
      );
      const actual = await userService.getFollowingsCount(userId);
      expect(userFollowingData.followingId.length).to.deep.equal(actual);
    });

    test('should return o as the user is not in the followingStatus table', async () => {
      when(userRepository.userExist(userId)).thenResolve(undefined);
      const actual = await userService.getFollowingsCount(userId);
      expect(0).to.deep.equal(actual);
    });
  });

  describe('Get Follower Count of a user', () => {
    test('should return the correct following count', async () => {
      when(userRepository.userExist(userId)).thenResolve(userId);
      when(userRepository.queryFollowingData(deepEqual(userId))).thenResolve(
        userFollowingData
      );
      const actual = await userService.getFollowersCount(userId);
      expect(userFollowingData.followingId.length).to.deep.equal(actual);
    });

    test('should return 0 as the user is not in the followingStatus table', async () => {
      when(userRepository.userExist(userId)).thenResolve(undefined);
      const actual = await userService.getFollowersCount(userId);
      expect(0).to.deep.equal(actual);
    });
  });

  describe('Get drafts by userid', () => {
    test('Should successfully return a list of drafts that is from the user with given userid', async () => {
      when(
        userRepository.getDraftsByUserid(deepEqual(postDraftQuery))
      ).thenResolve([post]);
      const actual = await userService.getDraftsByUserid(userId);
      expect([post]).to.deep.equal(actual);
    });
    test('Should fail to find the drafts if userId does not exist', async () => {
      when(
        userRepository.getDraftsByUserid(deepEqual(postDraftQuery))
      ).thenResolve(undefined);
      const promise = userService.getDraftsByUserid(userId);
      await expect(promise)
        .to.be.rejectedWith(NotFoundError)
        .and.eventually.have.property('code')
        .to.eq(ERROR_CODE.USER_NOT_FOUND);
    });
  });
});
