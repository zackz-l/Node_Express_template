import { IVideoRepository } from '../../domain/aggregates/video/video-repository';
import { injectable } from 'inversify';
import prisma from '../database/database';
import Comment from '../../domain/aggregates/comments/comment';
import VideoPost from '../../domain/aggregates/video/video';
import { VideoPostQuery } from '../../domain/aggregates/video/videopost-query';
import { PostStatus } from '@prisma/client';
import { CommentQuery } from '../../domain/aggregates/comments/comment-query';
import SubComment from '../../domain/aggregates/comments/sub-comment';
import { VideoInformation } from '../../domain/aggregates/video/video-information';
import { VideoSlicingStatus } from '@prisma/client';
import { DISTRIBUTED_URL } from '../../config/env-config';

@injectable()
export default class VideoRepository implements IVideoRepository {
  public async createVideoPost(post: VideoPost): Promise<string> {
    const createPost = await prisma.videoPost.create({
      data: {
        title: post.title,
        description: post.description,
        userId: post.userId!,
        createdAt: new Date(),
        updatedAt: new Date(),
        videoOriginalPath: '',
        thumbnail: ''
      }
    });
    return createPost.id;
  }

  public async getPostById(
    videoPostQuery: VideoPostQuery
  ): Promise<VideoPost | undefined> {
    const post = await prisma.videoPost.findUnique({
      where: {
        id: videoPostQuery.id
      }
    });

    return post && !post.deletedAt
      ? new VideoPost(
          post.title,
          post.description,
          post.userId,
          post.id,
          post.status
        )
      : undefined;
  }

  public async authorize(postId: string, userId: string): Promise<boolean> {
    const post = await prisma.videoPost.findFirst({
      where: {
        id: postId,
        userId: userId,
        deletedAt: null
      }
    });
    return post !== null;
  }

  public async checkUserEditCommentAuthorization(
    commentId: string,
    userId: string
  ): Promise<boolean> {
    const authorized = await prisma.comment.findFirst({
      where: {
        userId: userId,
        id: commentId
      }
    });
    return authorized != null;
  }

  public async editVideoPost(post: VideoPost): Promise<string> {
    const editPost = await prisma.videoPost.update({
      where: {
        id: post.id
      },
      data: {
        title: post.title,
        description: post.description,
        updatedAt: new Date(),
        gameMention: post.gameMentions
      }
    });
    return editPost.id;
  }

  public async publishVideoPost(postId: string): Promise<string> {
    const post = await prisma.videoPost.update({
      where: {
        id: postId
      },
      data: {
        updatedAt: new Date(),
        status: PostStatus.PUBLISHED
      }
    });
    return post.id;
  }

  public async deleteVideoPost(postId: string): Promise<string> {
    const post = await prisma.videoPost.update({
      where: {
        id: postId
      },
      data: {
        status: PostStatus.DELETED,
        deletedAt: new Date()
      }
    });
    return post.id;
  }

  public async getCommentById(
    commentQuery: CommentQuery
  ): Promise<Comment | undefined> {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentQuery.id
      }
    });

    return comment && !comment.deletedAt
      ? new Comment(
          comment.userId,
          comment.videoPostId!,
          comment.content,
          comment.id
        )
      : undefined;
  }

  public async createCommentToVideoPost(comment: Comment): Promise<string> {
    const createdComment = await prisma.comment.create({
      data: {
        userId: comment.userId,
        videoPostId: comment.postId,
        content: comment.content
      }
    });

    const connectCommentToPost = await prisma.videoPost.update({
      where: {
        id: comment.postId
      },
      data: {
        comments: {
          connect: {
            id: createdComment.id
          }
        }
      }
    });
    return createdComment.id;
  }

  public async createSubCommentToComment(
    subComment: SubComment
  ): Promise<string> {
    const createdSubComment = await prisma.subComment.create({
      data: {
        userId: subComment.userId,
        parentCommentId: subComment.parentCommentId,
        content: subComment.content
      }
    });

    const connectSubCommentToParent = await prisma.comment.update({
      where: {
        id: subComment.parentCommentId
      },
      data: {
        subComments: {
          connect: {
            id: createdSubComment.id
          }
        }
      }
    });
    return createdSubComment.id;
  }

  public async queryCommentsByVideoPost(
    postQuery: VideoPostQuery
  ): Promise<Comment[]> {
    const comments = await prisma.comment.findMany({
      skip: postQuery.pageIndex! * postQuery.pageLimit!,
      take: postQuery.pageLimit!,
      where: {
        videoPostId: postQuery.id,
        deletedAt: null
      },
      include: {
        subComments: { where: { deletedAt: null } }
      }
    });
    return comments;
  }

  public async queryPostsByTitle(
    postQuery: VideoPostQuery
  ): Promise<Array<VideoPost>> {
    const posts = await prisma.videoPost.findMany({
      skip: postQuery.pageIndex! * postQuery.pageLimit!,
      take: postQuery.pageLimit,
      where: {
        title: {
          contains: postQuery.title,
          mode: 'insensitive'
        },
        deletedAt: null,
        status: postQuery.status
      }
    });
    return posts.map(
      (post) =>
        new VideoPost(post.title, post.description, post.userId, post.id)
    );
  }

  public async queryPostsByUserId(
    postQuery: VideoPostQuery
  ): Promise<Array<VideoPost>> {
    const posts = await prisma.videoPost.findMany({
      skip: postQuery.pageIndex! * postQuery.pageLimit!,
      take: postQuery.pageLimit,
      where: {
        title: {
          contains: postQuery.title,
          mode: 'insensitive'
        },
        userId: postQuery.userId,
        deletedAt: null,
        status: postQuery.status
      }
    });
    return posts.map(
      (post) =>
        new VideoPost(post.title, post.description, post.userId, post.id)
    );
  }

  public async editComment(id: string, content: string): Promise<string> {
    const editComment = await prisma.comment.update({
      where: {
        id: id
      },
      data: {
        content: content
      }
    });
    return editComment.id;
  }

  public async getExistedComment(
    commentQuery: CommentQuery
  ): Promise<Comment | undefined> {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentQuery.id
      }
    });
    return comment && !comment.deletedAt
      ? new Comment(
          comment.userId,
          comment.videoPostId!,
          comment.content,
          comment.id
        )
      : undefined;
  }

  public async deleteComment(commentId: string): Promise<string> {
    const comment = await prisma.comment.update({
      where: {
        id: commentId
      },
      data: {
        deletedAt: new Date()
      }
    });

    const subcomment = await prisma.subComment.updateMany({
      where: {
        parentCommentId: commentId
      },
      data: {
        deletedAt: new Date()
      }
    });

    return comment.id;
  }

  public async getPostsByUserId(
    postQuery: VideoPostQuery
  ): Promise<Array<VideoPost>> {
    const posts = await prisma.videoPost.findMany({
      skip: postQuery.pageIndex! * postQuery.pageLimit!,
      take: postQuery.pageLimit,
      where: {
        userId: postQuery.userId,
        deletedAt: null,
        status: postQuery.status
      }
    });
    return posts.map(
      (post) =>
        new VideoPost(post.title, post.description, post.userId, post.id)
    );
  }

  public async updateGameMention(
    postQuery: VideoPostQuery
  ): Promise<string | undefined> {
    const gameMentionPost = await prisma.videoPost.update({
      where: {
        id: postQuery.id
      },
      data: {
        gameMention: postQuery.gameMention
      }
    });
    return gameMentionPost.id;
  }

  public async updateVideoPath(
    videoId: string,
    videoPath: string
  ): Promise<string> {
    const id = await prisma.videoPost.update({
      where: {
        id: videoId
      },
      data: {
        videoOriginalPath: videoPath
      }
    });
    return id.id;
  }

  public async videoInformationExist(
    videoOriginalPath: string
  ): Promise<string | undefined> {
    const videoInformation = await prisma.videoInformation.findFirst({
      where: {
        videoOriginalPath: videoOriginalPath
      }
    });
    return videoInformation ? videoInformation.id : undefined;
  }

  public async createVideoInformation(
    videoInfor: VideoInformation
  ): Promise<void> {
    await prisma.videoInformation.create({
      data: {
        postId: videoInfor.postId,
        res360p: videoInfor.res360p,
        res480p: videoInfor.res480p,
        res720p: videoInfor.res720p,
        res1080p: videoInfor.res1080p,
        videoOriginalPath: videoInfor.videoOriginalPath,
        mediaConverterJobId: videoInfor.mediaConverterJobId,
        mediaConverterStatus: VideoSlicingStatus.SUBMITTED
      }
    });
  }

  public async updateVideoInformation(
    videoInfor: VideoInformation,
    id: string
  ): Promise<void> {
    await prisma.videoInformation.update({
      where: {
        id: id
      },
      data: {
        postId: videoInfor.postId,
        res360p: videoInfor.res360p,
        res480p: videoInfor.res480p,
        res720p: videoInfor.res720p,
        res1080p: videoInfor.res1080p,
        videoOriginalPath: videoInfor.videoOriginalPath,
        mediaConverterJobId: videoInfor.mediaConverterJobId,
        mediaConverterStatus: VideoSlicingStatus.SUBMITTED
      }
    });
  }

  public async getVideoURLs(key: string): Promise<Array<string>> {
    var urls: string[] = [];
    const videoStatus = await prisma.videoInformation.findFirst({
      where: {
        postId: key,
        mediaConverterStatus: VideoSlicingStatus.COMPLETE
      }
    });
    if (videoStatus) {
      urls.push(
        DISTRIBUTED_URL + videoStatus.res360p,
        DISTRIBUTED_URL + videoStatus.res480p,
        DISTRIBUTED_URL + videoStatus.res720p,
        DISTRIBUTED_URL + videoStatus.res1080p
      );
    }
    return urls;
  }

  public async checkVideoConversion(videoPostId: string): Promise<boolean> {
    const videoStatus = await prisma.videoInformation.findFirst({
      where: {
        postId: videoPostId
      }
    });
    return videoStatus?.mediaConverterStatus == VideoSlicingStatus.COMPLETE;
  }
}
