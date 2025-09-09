import LoginUser from "./login-user";
import SignupUser from "./signup-user";
import FollowingStatus from "./following-status";
import { UserQuery } from "./user-query";
import { ProviderQuery } from "./provider-query";

export interface IAuthRepository {
  getLoginUserByEmail(userQuery: UserQuery): Promise<LoginUser | undefined>;
  findEmailAndUsernameDuplication(userQuery: UserQuery): Promise<boolean>;
  signupUser(signupUser: SignupUser): Promise<string>;
  deleteUser(loginUser: LoginUser): Promise<string>;
  createUserSession(userId: string): Promise<string>;
  authenticateUser(userId: string, sessionId: string): Promise<boolean>;
  getUserByUsername(userQuery: UserQuery): Promise<LoginUser | undefined>;
  updateUserPassword(loginUser: LoginUser): Promise<string>;
  getUserById(userQuery: UserQuery): Promise<LoginUser | undefined>;
  updateUsername(userId: string, username: string): Promise<string>;
  updateUsername(userId: string, username: string): Promise<string>;
  verifyEmail(userId: string): Promise<string>;
}
