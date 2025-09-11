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
import GetUserByUsernameRequest from "../api-models/user/get-user-by-username-request";
import GetUserByIdRequest from "../api-models/user/get-user-by-id-request";

import UserService from "../../domain/services/user";
import { inject } from "inversify";
import ChangePasswordRequest from "../api-models/user/change-password-request";
import GetUserResponse from "../api-models/user/get-user-by-username-response";
import UpdateUsernameRequest from "../api-models/user/update-username-request";
import authenticate from "../middlewares/authenticate";
import VerifyEmailRequest from "../api-models/user/verify-email-request";
// import ProviderSigninRequest from "../api-models/provider/signin-request";
// import VerifyPasscodeRequest from "../api-models/provider/verify-passcode";

@controller("/users")
export default class UserController {
  constructor(
    @inject(UserService)
    private readonly userService: UserService
  ) {}

  @httpGet("/username/:username")
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

  @httpGet("/:id")
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
}
