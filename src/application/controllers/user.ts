import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import {
  controller,
  httpGet,
  httpPatch,
  httpPost,
  httpDelete,
  httpPut
} from 'inversify-express-utils';
import GetUserByUsernameRequest from '../api-models/user/get-user-by-username-request';
import GetUserByIdRequest from '../api-models/user/get-user-by-id-request';
import FollowUserRequest from '../api-models/user/follow-user-request';
import UnfollowUserRequest from '../api-models/user/unfollow-user-request';
import GetFollowerCountRequest from '../api-models/user/get-follower-count';
import GetFollowingCountRequest from '../api-models/user/get-following-request';
import GetFollowersRequest from '../api-models/user/get-followers';
import GetFollowingsRequest from '../api-models/user/get-followers';
import UserService from '../../domain/services/user';
import { inject } from 'inversify';
import ChangePasswordRequest from '../api-models/user/change-password-request';
import GetUserResponse from '../api-models/user/get-user-by-username-response';
import UpdateUsernameRequest from '../api-models/user/update-username-request';
import getPostNumberByUserIdRequest from '../api-models/user/get-post-number-request';
import authenticate from '../middlewares/authenticate';
import VerifyEmailRequest from '../api-models/user/verify-email-request';
import ProviderSigninRequest from '../api-models/provider/signin-request';
import VerifyPasscodeRequest from '../api-models/provider/verify-passcode';
import GetDraftsByUseridRequest from '../api-models/general-post-models/get-drafts-by-userid-request';
import GetDraftsByUseridResponse from '../api-models/article/get-drafts-by-userid-response';
import GetPostByUseridRequest from '../api-models/general-post-models/get-post-by-userid-request';

@controller('/users')
export default class UserController {
  constructor(
    @inject(UserService)
    private readonly userService: UserService
  ) {}

  @httpGet('/username/:username')
  public async getUserByUsername(
    request: Request,
    response: Response
  ): Promise<void> {
    const getUserRequest = await new GetUserByUsernameRequest(
      request
    ).validate();
    // call functions inside domain
    const { username } = getUserRequest;
    const loginUser = await this.userService.getUserByUsername(username);
    response
      .status(HttpStatusCode.OK)
      .json(GetUserResponse.fromLoginUser(loginUser));
  }

  @httpGet('/:id')
  public async getUserByUserId(
    request: Request,
    response: Response
  ): Promise<void> {
    const getUserIdRequest = await new GetUserByIdRequest(request).validate();
    // call functions inside domain
    const { userId } = getUserIdRequest;
    const loginUser = await this.userService.getUserById(userId);

    response
      .status(HttpStatusCode.OK)
      .json(GetUserResponse.fromLoginUser(loginUser));
  }

  @httpGet('/:id/publishposts/count')
  public async getPostNumberByUserId(
    request: Request,
    response: Response
  ): Promise<void> {
    const getPostNumberRequest = await new getPostNumberByUserIdRequest(
      request
    ).validate();
    const { userId } = getPostNumberRequest;
    const getPostNumberUser = await this.userService.getPostNumber(userId);
    response.status(HttpStatusCode.OK).json({ postCount: getPostNumberUser });
  }

  @httpGet('/draftposts/:userId')
  public async getdraftsByUserid(
    request: Request,
    response: Response
  ): Promise<void> {
    const getUserIdRequest = await new GetDraftsByUseridRequest(
      request
    ).validate();
    const { userId } = getUserIdRequest;
    const post = await this.userService.getDraftsByUserid(userId);
    response
      .status(HttpStatusCode.OK)
      .json(GetDraftsByUseridResponse.fromPosts(post));
  }

  @httpGet('/:userId/followerscount')
  public async getFollowersCount(
    request: Request,
    response: Response
  ): Promise<void> {
    const getFollowerCountRequest = await new GetFollowerCountRequest(
      request
    ).validate();
    const { userId } = getFollowerCountRequest;
    const count = await this.userService.getFollowersCount(userId);
    response.status(HttpStatusCode.OK).json({ followerCount: count });
  }

  @httpGet('/:userId/followingscount')
  public async getFollowingsCount(
    request: Request,
    response: Response
  ): Promise<void> {
    const getFollowingCountRequest = await new GetFollowingCountRequest(
      request
    ).validate();
    const { userId } = getFollowingCountRequest;
    const count = await this.userService.getFollowingsCount(userId);
    response.status(HttpStatusCode.OK).json({ followerCount: count });
  }

  @httpGet('/:userId/followers')
  public async getFollowers(
    request: Request,
    response: Response
  ): Promise<void> {
    const getFollowersRequest = await new GetFollowersRequest(
      request
    ).validate();
    const { userId } = getFollowersRequest;
    const followersList = await this.userService.getFollowersList(userId);
    response.status(HttpStatusCode.OK).json({ followerList: followersList });
  }

  @httpGet('/:userId/followings')
  public async getFollowings(
    request: Request,
    response: Response
  ): Promise<void> {
    const getFollowingsRequest = await new GetFollowingsRequest(
      request
    ).validate();
    const { userId } = getFollowingsRequest;
    const followingsList = await this.userService.getFollowingsList(userId);
    response.status(HttpStatusCode.OK).json({ followingList: followingsList });
  }

  @httpGet('/:userId/posts')
  public async queryPostsByUserId(
    request: Request,
    response: Response
  ): Promise<void> {
    const getPostsByUserIdRequest = await new GetPostByUseridRequest(
      request
    ).validate();
    const { userId, pageIndex, pageLimit } = getPostsByUserIdRequest;
    const articelsAndVideos = await this.userService.queryArticlesAndVideos(
      userId,
      pageIndex,
      pageLimit
    );
    response.status(HttpStatusCode.OK).json({ allPosts: articelsAndVideos });
  }
}
