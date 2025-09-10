import { IAuthRepository } from "../../domain/aggregates/auth/auth-repository";
import LoginUser from "../../domain/aggregates/auth/login-user";
import SignupUser from "../../domain/aggregates/auth/signup-user";
import FollowingStatus from "../../domain/aggregates/auth/following-status";
import { UserQuery } from "../../domain/aggregates/auth/user-query";
import { ProviderQuery } from "../../domain/aggregates/auth/provider-query";
import { injectable } from "inversify";
import prisma from "../database/database";
import { UserStatus } from "@prisma/client";
import moment from "moment";

@injectable()
export default class AuthRepository implements IAuthRepository {
  public async getLoginUserByEmail(
    userQuery: UserQuery
  ): Promise<LoginUser | undefined> {
    const user = await prisma.user.findUnique({
      where: {
        email: userQuery.email,
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

  public async findEmailAndUsernameDuplication(
    userQuery: UserQuery
  ): Promise<boolean> {
    const findDuplicatedUserDocument = await prisma.user.findMany({
      where: {
        OR: [{ username: userQuery.username }, { email: userQuery.email }],
      },
    });
    return findDuplicatedUserDocument.length == 0 ? false : true;
  }

  public async signupUser(signupUser: SignupUser): Promise<string> {
    const signupedUser = await prisma.user.create({
      data: {
        email: signupUser.email,
        username: signupUser.username,
        password: signupUser.password,
        avatarIcon: "",
      },
    });
    return signupedUser.id;
  }

  public async verifyEmail(userId: string): Promise<string> {
    const verifiedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserStatus.VERIFIED,
      },
    });
    return verifiedUser.id;
  }

  public async createUserSession(userId: string): Promise<string> {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const expiredAt = now;

    const userSession = await prisma.userSession.upsert({
      create: {
        userId,
        expiredAt,
      },
      update: {
        expiredAt,
        updatedAt: new Date(),
      },
      where: {
        userId,
      },
    });

    return userSession?.id;
  }

  public async authenticateUser(
    userId: string,
    sessionId: string
  ): Promise<boolean> {
    const userSession = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });
    const now = new Date();

    if (!userSession || now > userSession.expiredAt) {
      return false;
    }
    now.setDate(now.getDate() + 1);
    await prisma.userSession.update({
      where: {
        id: userSession.id,
      },
      data: {
        expiredAt: now,
      },
    });
    return true;
  }

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

  public async updateUserPassword(loginUser: LoginUser): Promise<string> {
    await prisma.user.update({
      where: {
        id: loginUser.id,
      },
      data: {
        password: loginUser.password,
      },
    });
    return loginUser.id;
  }

  public async deleteUser(loginUser: LoginUser): Promise<string> {
    const deleteUser = await prisma.user.update({
      data: {
        email: `${loginUser.email}-${loginUser.id}`,
        username: `${loginUser.username}-${loginUser.id}`,
        deletedAt: new Date(),
      },
      where: {
        id: loginUser.id,
      },
    });
    return loginUser.id;
  }

  public async updateUsername(
    userId: string,
    username: string
  ): Promise<string> {
    const updateUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: username,
      },
    });
    return updateUser.id;
  }
}
