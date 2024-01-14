import { IUserRepository } from '../../domain/aggregates/users/user-repository';
import LoginUser from '../../domain/aggregates/auth/login-user';
import SignupUser from '../../domain/aggregates/auth/signup-user';
import FollowingStatus from '../../domain/aggregates/auth/following-status';
import { UserQuery } from '../../domain/aggregates/auth/user-query';
import { ProviderQuery } from '../../domain/aggregates/auth/provider-query';
import { injectable } from 'inversify';
import prisma from '../database/database';
import { PostStatus, UserStatus, VideoSlicingStatus } from '@prisma/client';
import moment from 'moment';
import { PostQuery } from '../../domain/aggregates/articles/article-query';
import Post from '../../domain/aggregates/articles/article';
import VideoPost from '../../domain/aggregates/video/video';
import ArticlesAndVideos from '../../domain/aggregates/articles-and-videos';
import { ERROR_CODE, NotFoundError } from '../../errors';
import { DISTRIBUTED_URL } from '../../config/env-config';

@injectable()
export default class UserRepository implements IUserRepository {
  public async getUserByUsername(
    userQuery: UserQuery
  ): Promise<LoginUser | undefined> {
    const user = await prisma.user.findUnique({
      where: {
        username: userQuery.username
      }
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
        id: userQuery.userId
      }
    });

    return user && !user.deletedAt
      ? new LoginUser(user.username, user.email, user.password, user.id)
      : undefined;
  }

  public async getPostNumber(loginUser: LoginUser): Promise<number> {
    const postCount = await prisma.article.count({
      where: {
        userId: loginUser.id,
        status: PostStatus.PUBLISHED
      }
    });
    const videoPostCount = await prisma.videoPost.count({
      where: {
        userId: loginUser.id,
        status: PostStatus.PUBLISHED
      }
    });
    return postCount + videoPostCount;
  }

  public async getDraftsByUserid(
    postQuery: PostQuery
  ): Promise<Post[] | undefined> {
    const posts = await prisma.article.findMany({
      where: {
        userId: postQuery.userId,
        status: postQuery.status
      }
    });
    return posts;
  }

  public async userExist(userId: string): Promise<string | undefined> {
    const hasFollowee = await prisma.followingTable.findUnique({
      where: {
        userId: userId
      }
    });
    return hasFollowee ? hasFollowee.userId : undefined;
  }

  public async createFollowingTable(
    userId: string,
    followingId: string
  ): Promise<string> {
    const followerTable = await prisma.followingTable.create({
      data: {
        userId: userId,
        followingId: [followingId]
      }
    });
    return followerTable.userId;
  }

  public async createFollowerTable(
    userId: string,
    followerId: string
  ): Promise<string> {
    const followerTable = await prisma.followingTable.create({
      data: {
        userId: userId,
        followerId: [followerId]
      }
    });
    return followerTable.userId;
  }

  public async queryFollowingData(userId: string): Promise<FollowingStatus> {
    const followerAndFollowee = await prisma.followingTable.findUnique({
      where: {
        userId: userId
      }
    });
    return new FollowingStatus(
      followerAndFollowee!.userId,
      followerAndFollowee!.followingId,
      followerAndFollowee!.followerId
    );
  }

  public async updateFollowingTable(
    userId: string,
    followingList: string[]
  ): Promise<string> {
    const user = await prisma.followingTable.update({
      where: {
        userId: userId
      },
      data: {
        followingId: followingList
      }
    });
    return user.userId;
  }

  public async updateFollowerTable(
    userId: string,
    followerList: string[]
  ): Promise<string> {
    const user = await prisma.followingTable.update({
      where: {
        userId: userId
      },
      data: {
        followerId: followerList
      }
    });
    return user.userId;
  }

  public async queryArticles(
    userId: string,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<ArticlesAndVideos>> {
    const articles = await prisma.article.findMany({
      where: {
        userId: userId,
        deletedAt: null,
        status: PostStatus.PUBLISHED
      },
      skip: pageIndex * pageLimit,
      take: pageLimit,
      orderBy: [
        {
          createdAt: 'desc'
        }
      ]
    });
    return articles.map(
      (article) =>
        new ArticlesAndVideos(
          article.title,
          article.userId,
          article.id,
          article.gameMention,
          article.createdAt!,
          'Article',
          undefined,
          article.content
        )
    );
  }

  public async queryVideos(
    userId: string,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<ArticlesAndVideos>> {
    const videos = await prisma.videoPost.findMany({
      where: {
        userId: userId,
        deletedAt: null,
        status: PostStatus.PUBLISHED
      },
      skip: pageIndex * pageLimit,
      take: pageLimit,
      include: {
        VideoInformation: {
          where: {
            mediaConverterStatus: VideoSlicingStatus.COMPLETE
          }
        }
      },
      orderBy: [
        {
          createdAt: 'desc'
        }
      ]
    });
    return await Promise.all(
      videos.map(
        async (video) =>
          new ArticlesAndVideos(
            video.title,
            video.userId,
            video.id,
            video.gameMention,
            video.createdAt!,
            'Video',
            video.description,
            undefined,
            await this.getVideoURLs(video.id),
            DISTRIBUTED_URL +
              '/video/' +
              video.id +
              '/convert/Thumbnails/' +
              video.id +
              'Thumbnails.0000000.jpg'
          )
      )
    );
  }

  public async validUser(userId: string): Promise<string | undefined> {
    const validUser = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    return validUser ? validUser.id : undefined;
  }

  public async getVideoURLs(id: string): Promise<Array<string>> {
    var urls: string[] = [];
    const videoStatus = await prisma.videoInformation.findFirst({
      where: {
        postId: id,
        mediaConverterStatus: VideoSlicingStatus.COMPLETE
      }
    });
    if (!videoStatus) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Video with viodePostId: ${id} has not finish conversion yet.`
      );
    }
    urls.push(
      DISTRIBUTED_URL + videoStatus.res360p,
      DISTRIBUTED_URL + videoStatus.res480p,
      DISTRIBUTED_URL + videoStatus.res720p,
      DISTRIBUTED_URL + videoStatus.res1080p
    );
    return urls;
  }
}
