import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import {
  controller,
  httpGet,
  httpPatch,
  httpPost,
  httpDelete,
  httpPut,
} from "inversify-express-utils";
import SignupRequest from "../api-models/user/signup-request";
import SigninRequest from "../api-models/user/signin-request";
import DeleteRequest from "../api-models/user/delete-user-request";
import FollowUserRequest from "../api-models/user/follow-user-request";
import UnfollowUserRequest from "../api-models/user/unfollow-user-request";
import AuthService from "../../domain/services/auth";
import { inject } from "inversify";
import ChangePasswordRequest from "../api-models/user/change-password-request";
import UpdateUsernameRequest from "../api-models/user/update-username-request";
import authenticate from "../middlewares/authenticate";
import VerifyEmailRequest from "../api-models/user/verify-email-request";

@controller("/auth")
export default class AuthController {
  constructor(
    @inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @httpPost("/signup")
  public async signup(request: Request, response: Response): Promise<void> {
    const signupRequest = await new SignupRequest(request).validate();
    const userId = await this.authService.signupUser(
      signupRequest.toSignupUser()
    );
    response.status(HttpStatusCode.CREATED).json({ id: userId });
  }

  @httpGet("/verify-email")
  public async verifyEmail(
    request: Request,
    response: Response
  ): Promise<void> {
    const verifyEmailRequest = await new VerifyEmailRequest(request).validate();
    const { token } = verifyEmailRequest;
    const userId = await this.authService.verifyEmail(token);
    response.status(HttpStatusCode.OK).json({ id: userId });
  }

  @httpPost("/login")
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

  @httpPatch("/users/change-password", authenticate)
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

  @httpDelete("/", authenticate)
  public async deleteUser(request: Request, response: Response): Promise<void> {
    const deleteUser = await new DeleteRequest(request).validate();
    // call functions inside domain
    const { id } = deleteUser;
    const userId = await this.authService.deleteUser(id);
    response.sendStatus(HttpStatusCode.OK).json({ id: userId });
  }

  @httpPatch("/users/username", authenticate)
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
}
