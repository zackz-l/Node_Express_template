import FollowingStatus from "../auth/following-status";
import LoginUser from "../auth/login-user";
import { UserQuery } from "../auth/user-query";

export interface IUserRepository {
  getUserByUsername(userQuery: UserQuery): Promise<LoginUser | undefined>;
  getUserById(userQuery: UserQuery): Promise<LoginUser | undefined>;
}
