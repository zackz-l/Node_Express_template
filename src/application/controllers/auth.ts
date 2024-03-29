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
import SignupRequest from '../api-models/user/signup-request';
import SigninRequest from '../api-models/user/signin-request';
import GetUserByUsernameRequest from '../api-models/user/get-user-by-username-request';
import DeleteRequest from '../api-models/user/delete-user-request';
import GetUserByIdRequest from '../api-models/user/get-user-by-id-request';
import FollowUserRequest from '../api-models/user/follow-user-request';
import UnfollowUserRequest from '../api-models/user/unfollow-user-request';
import GetFollowerCountRequest from '../api-models/user/get-follower-count';
import GetFollowingCountRequest from '../api-models/user/get-following-request';
import GetFollowersRequest from '../api-models/user/get-followers';
import GetFollowingsRequest from '../api-models/user/get-followers';
import AuthService from '../../domain/services/auth';
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

@controller('/auth')
export default class AuthController {
  constructor(
    @inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @httpPost('/signup')
  public async signup(request: Request, response: Response): Promise<void> {
    const signupRequest = await new SignupRequest(request).validate();
    const userId = await this.authService.signupUser(
      signupRequest.toSignupUser()
    );
    response.status(HttpStatusCode.CREATED).json({ id: userId });
  }

  @httpGet('/verify-email')
  public async verifyEmail(
    request: Request,
    response: Response
  ): Promise<void> {
    const verifyEmailRequest = await new VerifyEmailRequest(request).validate();
    const { token } = verifyEmailRequest;
    const userId = await this.authService.verifyEmail(token);
    response.status(HttpStatusCode.OK).json({ id: userId });
  }

  @httpPost('/login')
  public async login(request: Request, response: Response): Promise<void> {
    const signInUser = await new SigninRequest(request).validate();
    // call functions inside domain
    const { email, password } = signInUser;
    const { loginUser, sessionId } = await this.authService.login(
      email,
      password
    );

    response
      .status(HttpStatusCode.OK)
      .json({ id: loginUser.id, sessionId, userType: loginUser.type });
  }

  ///Move to users controller///
  // @httpGet('/users/username/:username')
  // public async getUserByUsername(
  //   request: Request,
  //   response: Response
  // ): Promise<void> {
  //   const getUserRequest = await new GetUserByUsernameRequest(
  //     request
  //   ).validate();
  //   // call functions inside domain
  //   const { username } = getUserRequest;
  //   const loginUser = await this.authService.getUserByUsername(username);
  //   response
  //     .status(HttpStatusCode.OK)
  //     .json(GetUserResponse.fromLoginUser(loginUser));
  // }

  ///Move to users controller///
  // @httpGet('/users/:id')
  // public async getUserByUserId(
  //   request: Request,
  //   response: Response
  // ): Promise<void> {
  //   const getUserIdRequest = await new GetUserByIdRequest(request).validate();
  //   // call functions inside domain
  //   const { userId } = getUserIdRequest;
  //   const loginUser = await this.authService.getUserById(userId);

  //   response
  //     .status(HttpStatusCode.OK)
  //     .json(GetUserResponse.fromLoginUser(loginUser));
  // }

  @httpPatch('/users/change-password', authenticate)
  public async changeUserPassword(
    request: Request,
    response: Response
  ): Promise<void> {
    const changePasswordRequest = await new ChangePasswordRequest(
      request
    ).validate();
    const { userId, password } = changePasswordRequest;
    const loginUserId = await this.authService.updateUserPassword(
      userId,
      password
    );
    response.status(HttpStatusCode.OK).json({ id: loginUserId });
  }

  @httpDelete('/', authenticate)
  public async deleteUser(request: Request, response: Response): Promise<void> {
    const deleteUser = await new DeleteRequest(request).validate();
    // call functions inside domain
    const { id } = deleteUser;
    const userId = await this.authService.deleteUser(id);
    response.sendStatus(HttpStatusCode.OK).json({ id: userId });
  }

  @httpPatch('/users/username', authenticate)
  public async updateUsername(
    request: Request,
    response: Response
  ): Promise<void> {
    const updateUsernameRequest = await new UpdateUsernameRequest(
      request
    ).validate();
    const { userId, username } = updateUsernameRequest;
    const updateUserId = await this.authService.updateUsername(
      userId,
      username
    );
    response.status(HttpStatusCode.OK).json({ id: updateUserId });
  }

  ///Move to users controller///
  // @httpGet('/users/:id/posts/count')
  // public async getPostNumberByUserId(
  //   request: Request,
  //   response: Response
  // ): Promise<void> {
  //   const getPostNumberRequest = await new getPostNumberByUserIdRequest(
  //     request
  //   ).validate();
  //   const { userId } = getPostNumberRequest;
  //   const getPostNumberUser = await this.authService.getPostNumber(userId);
  //   response.status(HttpStatusCode.OK).json({ postCount: getPostNumberUser });
  // }

  @httpPost('/provider/login')
  public async providerLogin(
    request: Request,
    response: Response
  ): Promise<void> {
    const providerSigninRequest = await new ProviderSigninRequest(
      request
    ).validate();
    const { email } = providerSigninRequest;
    const providerId = await this.authService.providerLogin(email);
    response.status(HttpStatusCode.OK).json({ id: providerId });
  }

  @httpPost('/provider/verify-passcode')
  public async verifyPasscode(
    request: Request,
    response: Response
  ): Promise<void> {
    const verifyPasscodeRequest = await new VerifyPasscodeRequest(
      request
    ).validate();
    const { email, passcode } = verifyPasscodeRequest;
    const { providerId, providerSessionId } =
      await this.authService.verifyPasscode(email, passcode);

    response
      .status(HttpStatusCode.OK)
      .json({ providerId: providerId, providerSessionId: providerSessionId });
  }

  @httpPost('/users/:followingId/follow')
  public async followUsers(
    request: Request,
    response: Response
  ): Promise<void> {
    const followUserRequest = await new FollowUserRequest(request).validate();
    const { userId, followingId } = followUserRequest;
    const id = await this.authService.followUser(userId, followingId);
    response.status(HttpStatusCode.OK).json({ userId: id });
  }

  @httpPost('/users/:unfollowId/unfollow')
  public async unfollowUsers(
    request: Request,
    response: Response
  ): Promise<void> {
    const unfollowUserRequest = await new UnfollowUserRequest(
      request
    ).validate();
    const { userId, unfollowId } = unfollowUserRequest;
    const id = await this.authService.unfollowUser(userId, unfollowId);
    response.status(HttpStatusCode.OK).json({ userId: id });
  }
}
