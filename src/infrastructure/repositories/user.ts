import { IUserRepository } from "../../domain/aggregates/users/user-repository";
import LoginUser from "../../domain/aggregates/auth/login-user";
import SignupUser from "../../domain/aggregates/auth/signup-user";
import FollowingStatus from "../../domain/aggregates/auth/following-status";
import { UserQuery } from "../../domain/aggregates/auth/user-query";
import { ProviderQuery } from "../../domain/aggregates/auth/provider-query";
import { injectable } from "inversify";
import prisma from "../database/database";
import moment from "moment";

import { ERROR_CODE, NotFoundError } from "../../errors";
import { DISTRIBUTED_URL } from "../../config/env-config";

@injectable()
export default class UserRepository implements IUserRepository {
  public async getUserByUsername(
    userQuery: UserQuery
  ): Promise<LoginUser | undefined> {
    const user = await prisma.user.findUnique({
      where: {
        username: userQuery.username,
      },
    });

    return user
      ? new LoginUser(user.username, user.email, user.password, user.id)
      : undefined;
  }

  public async getUserById(
    userQuery: UserQuery
  ): Promise<LoginUser | undefined> {
    const user = await prisma.user.findUnique({
      where: {
        id: userQuery.userId,
      },
    });

    return user && !user.deletedAt
      ? new LoginUser(user.username, user.email, user.password, user.id)
      : undefined;
  }
}
