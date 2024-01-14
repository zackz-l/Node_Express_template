import LoginUser from './login-user';
import SignupUser from './signup-user';
import FollowingStatus from './following-status';
import { UserQuery } from './user-query';
import { ProviderQuery } from './provider-query';
import { PostQuery } from '../articles/article-query';
import Post from '../articles/article';

export interface IAuthRepository {
  getLoginUserByEmail(userQuery: UserQuery): Promise<LoginUser | undefined>;
  foundEmailAndUsernameDuplication(userQuery: UserQuery): Promise<boolean>;
  signupUser(signupUser: SignupUser): Promise<string>;
  deleteUser(loginUser: LoginUser): Promise<string>;
  createUserSession(userId: string): Promise<string>;
  authenticateUser(userId: string, sessionId: string): Promise<boolean>;
  // getUserByUsername(userQuery: UserQuery): Promise<LoginUser | undefined>;
  updateUserPassword(loginUser: LoginUser): Promise<string>;
  // getUserById(userQuery: UserQuery): Promise<LoginUser | undefined>;
  updateUsername(userId: string, username: string): Promise<string>;
  // getPostNumber(loginUser: LoginUser): Promise<number>;
  verifyEmail(userId: string): Promise<string>;
  updateProviderPasscode(email: string, passcode: string): Promise<string>;
  // deleteProviderPasscode(email: string): Promise<void>;
  getProviderPasscode(
    providerQuery: ProviderQuery
  ): Promise<string | undefined>;
  createProvider(providerQuery: ProviderQuery): Promise<string>;
  getProviderByEmail(providerQuery: ProviderQuery): Promise<string | undefined>;
  createProviderSession(providerId: string): Promise<string>;
  verifyPasscode(email: string, passcode: string): Promise<boolean>;
  // userExist(userId: string): Promise<string | undefined>;
  // createFollowingTable(userId: string, followeeId: string): Promise<string>;
  // queryFollowingData(userId: string): Promise<FollowingStatus>;
  // updateFollowingTable(userId: string, followeeList: string[]): Promise<string>;
  // createFollowerTable(userId: string, followeeId: string): Promise<string>;
  // updateFollowerTable(userId: string, followeeList: string[]): Promise<string>;
  // getDraftsByUserid(postQuery: PostQuery): Promise<Post[] | undefined>;
}
