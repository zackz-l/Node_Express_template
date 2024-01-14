import FollowingStatus from '../auth/following-status';
import LoginUser from '../auth/login-user';
import { UserQuery } from '../auth/user-query';
import Post from '../articles/article';
import { PostQuery } from '../articles/article-query';
import ArticlesAndVideos from '../articles-and-videos';

export interface IUserRepository {
  getUserByUsername(userQuery: UserQuery): Promise<LoginUser | undefined>;
  getUserById(userQuery: UserQuery): Promise<LoginUser | undefined>;
  getPostNumber(loginUser: LoginUser): Promise<number>;
  getDraftsByUserid(postQuery: PostQuery): Promise<Post[] | undefined>;
  userExist(userId: string): Promise<string | undefined>;
  createFollowingTable(userId: string, followeeId: string): Promise<string>;
  queryFollowingData(userId: string): Promise<FollowingStatus>;
  updateFollowingTable(userId: string, followeeList: string[]): Promise<string>;
  createFollowerTable(userId: string, followeeId: string): Promise<string>;
  updateFollowerTable(userId: string, followeeList: string[]): Promise<string>;
  queryArticles(
    userId: string,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<ArticlesAndVideos>>;
  queryVideos(
    userId: string,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<ArticlesAndVideos>>;
  validUser(userId: string): Promise<string | undefined>;
  getVideoURLs(id: string): Promise<Array<string>>;
}
