import { IUserRepository } from '../aggregates/users/user-repository';
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
import ArticlesAndVideos from '../aggregates/articles-and-videos';

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

  public async getPostNumber(userId: string): Promise<number> {
    const userQuery: UserQuery = { userId: userId };
    const loginUser = await this.userRepository.getUserById(userQuery);
    if (!loginUser) {
      throw new NotFoundError(
        ERROR_CODE.USER_DOES_NOT_EXIST,
        `Find post of user with userId: ${userId} does not exist.`
      );
    } else {
      const postCount = await this.userRepository.getPostNumber(loginUser);
      return postCount;
    }
  }

  public async getDraftsByUserid(userId: string): Promise<Array<Post>> {
    const getDraftsByUseridQuery: PostQuery = {
      userId: userId,
      status: PostStatus.DRAFT
    };
    const posts = await this.userRepository.getDraftsByUserid(
      getDraftsByUseridQuery
    );
    if (!posts) {
      throw new NotFoundError(
        ERROR_CODE.USER_NOT_FOUND,
        `User with userId: ${userId} is trying to find a non-existing draft with userId: ${userId}.`
      );
    }
    return posts;
  }

  public async getFollowersCount(userId: string): Promise<Number> {
    const userExist = await this.userRepository.userExist(userId);
    if (!userExist) return 0;
    const list = await this.userRepository.queryFollowingData(userId);
    return list.followerId.length;
  }

  public async getFollowingsCount(userId: string): Promise<Number> {
    const userExist = await this.userRepository.userExist(userId);
    if (!userExist) return 0;
    const list = await this.userRepository.queryFollowingData(userId);
    return list.followingId.length;
  }

  public async getFollowersList(userId: string): Promise<Array<string>> {
    const userExist = await this.userRepository.userExist(userId);
    if (!userExist) return [];
    const followerList = await this.userRepository.queryFollowingData(userId);
    return followerList.followerId;
  }

  public async getFollowingsList(userId: string): Promise<Array<string[]>> {
    const userExist = await this.userRepository.userExist(userId);
    if (!userExist) return [];
    const followingList = await this.userRepository.queryFollowingData(userId);
    const followingInfor = await Promise.all(
      followingList.followerId.map(async (followerId) => [
        followerId,
        (await this.getPostNumber(followerId)).toString(),
        (await this.getFollowersCount(followerId)).toString()
      ])
    );
    return followingInfor;
  }

  public async queryArticlesAndVideos(
    userId: string,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<ArticlesAndVideos>> {
    const userExist = await this.userRepository.validUser(userId);
    if (!userExist) return [];
    var articles = await this.userRepository.queryArticles(
      userId,
      pageIndex,
      pageLimit
    );
    var vidoes = await this.userRepository.queryVideos(
      userId,
      pageIndex,
      pageLimit
    );
    var articlesAndVideos = articles.concat(vidoes);
    articlesAndVideos = articlesAndVideos.sort((a, b) => {
      return a.createdDate.valueOf() - b.createdDate.valueOf();
    });
    return articlesAndVideos;
  }
}
