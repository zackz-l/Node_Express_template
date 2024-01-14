import { IVideoRepository } from '../aggregates/video/video-repository';
import TYPES from '../constants/types';
import { inject, injectable } from 'inversify';
import Post from '../aggregates/articles/article';
import Comment from '../aggregates/comments/comment';
import { PostQuery } from '../aggregates/articles/article-query';
import { CommentQuery } from '../aggregates/comments/comment-query';
import {
  ERROR_CODE,
  NotFoundError,
  AuthorizationError,
  AuthenticationError
} from '../../errors/index';
import SubComment from '../aggregates/comments/sub-comment';
import { PostStatus } from '@prisma/client';
import { IFileStorage } from '../contracts/file-storage';
import VideoPost from '../aggregates/video/video';
import { VideoPostQuery } from '../aggregates/video/videopost-query';
import { VideoInformation } from '../aggregates/video/video-information';
import { DISTRIBUTED_URL } from '../../config/env-config';

@injectable()
export default class VideoService {
  constructor(
    @inject(TYPES.VideoRepository)
    private readonly videoRepository: IVideoRepository,
    @inject(TYPES.FileStorage)
    private readonly fileStorage: IFileStorage
  ) {}

  public async createVideoPost(videoPost: VideoPost): Promise<string> {
    return this.videoRepository.createVideoPost(videoPost);
  }

  public async authorize(postId: string, userId: string): Promise<string> {
    const authorized = await this.videoRepository.authorize(postId, userId);
    if (!authorized) {
      throw new AuthorizationError(
        ERROR_CODE.UNAUTHORIZED_OPERATION,
        `User with userId: ${userId} trying to modify post with postId: ${postId} is not authorized.`
      );
    }
    return postId;
  }

  public async authorizeEditComment(
    commentId: string,
    userId: string
  ): Promise<void> {
    const commentQuery: CommentQuery = {
      id: commentId
    };
    const existComment = await this.videoRepository.getCommentById(
      commentQuery
    );
    if (!existComment) {
      throw new AuthorizationError(
        ERROR_CODE.UNAUTHORIZED_OPERATION,
        `No such comment with commentId: ${commentId}.`
      );
    }
    const authorized =
      await this.videoRepository.checkUserEditCommentAuthorization(
        commentId,
        userId
      );
    if (!authorized) {
      throw new AuthorizationError(
        ERROR_CODE.UNAUTHORIZED_OPERATION,
        `User with userId: ${userId} trying to modify comment with commentId: ${commentId} is not authorized.`
      );
    }
  }

  public async editVideoPost(videoPost: VideoPost): Promise<string> {
    const postQuery: VideoPostQuery = { id: videoPost.id };
    const editPost = await this.videoRepository.getPostById(postQuery);
    if (!editPost) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `User with userId: ${videoPost.userId} is trying to edit non-existing post with postId: ${videoPost.id}.`
      );
    }
    return this.videoRepository.editVideoPost(videoPost);
  }

  public async publishVideoPost(
    postId: string,
    userId: string
  ): Promise<string> {
    const postQuery: VideoPostQuery = { id: postId };
    const publishPost = await this.videoRepository.getPostById(postQuery);
    if (!publishPost) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `User with userId: ${userId} is trying to publish non-existing post with postId: ${postId}.`
      );
    }
    return this.videoRepository.publishVideoPost(postId);
  }

  public async deleteVideoPost(
    postId: string,
    userId: string
  ): Promise<string> {
    const deletePostQuery: VideoPostQuery = { id: postId };
    const deletePost = await this.videoRepository.getPostById(deletePostQuery);
    if (!deletePost) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `User with userId: ${userId} is trying to delete non-existing post with postId: ${postId}.`
      );
    }
    return this.videoRepository.deleteVideoPost(postId);
  }

  public async getPostById(postId: string): Promise<VideoPost> {
    const getPostByIdQuery: VideoPostQuery = { id: postId };
    const post = await this.videoRepository.getPostById(getPostByIdQuery);
    if (!post) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Post with Id: ${postId} does not exist.`
      );
    }
    return post;
  }

  public async createCommentToVideoPost(comment: Comment): Promise<string> {
    const videoPostQuery: VideoPostQuery = { id: comment.postId };
    const post = await this.videoRepository.getPostById(videoPostQuery);
    if (!post) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `User with userId: ${comment.userId} is trying to comment on non-existing post with postId: ${comment.postId}.`
      );
    }
    return this.videoRepository.createCommentToVideoPost(comment);
  }

  public async createSubCommentToComment(
    subComment: SubComment,
    postId: string
  ): Promise<string> {
    const commentQuery: CommentQuery = {
      id: subComment.parentCommentId
    };
    const parentComment = await this.videoRepository.getCommentById(
      commentQuery
    );
    if (!parentComment || parentComment.postId !== postId) {
      throw new NotFoundError(
        ERROR_CODE.COMMENT_NOT_FOUND,
        `User with userId: ${subComment.userId} is trying to comment on non-existing comment with commentId: ${subComment.parentCommentId}.`
      );
    }
    return this.videoRepository.createSubCommentToComment(subComment);
  }

  public async queryCommentsByVideoPost(
    postId: string,
    pageIndex: number,
    pageLimit: number
  ): Promise<Comment[]> {
    const videoPostQuery: VideoPostQuery = {
      id: postId,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    const post = await this.videoRepository.getPostById(videoPostQuery);
    if (!post) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Post trying to get comments with postId: ${postId} does not exist.`
      );
    }
    return this.videoRepository.queryCommentsByVideoPost(videoPostQuery);
  }

  public async queryPostsByTitle(
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<VideoPost>> {
    const findPostByTitleQuery: VideoPostQuery = {
      title: title,
      status: PostStatus.PUBLISHED,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    return this.videoRepository.queryPostsByTitle(findPostByTitleQuery);
  }

  public async queryPostsByUserId(
    userId: string,
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<VideoPost>> {
    const findPostByUserIdQuery: VideoPostQuery = {
      userId: userId,
      title: title,
      status: PostStatus.PUBLISHED,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    return this.videoRepository.queryPostsByUserId(findPostByUserIdQuery);
  }

  public async editComment(
    commentId: string,
    newContent: string
  ): Promise<string> {
    const getExistedComment: CommentQuery = {
      id: commentId
    };
    const existedComment =
      this.videoRepository.getExistedComment(getExistedComment);
    if (!existedComment) {
      throw new NotFoundError(
        ERROR_CODE.COMMENT_NOT_FOUND,
        `Comment trying to get comments with commentId: ${commentId} does not exist.`
      );
    }
    return this.videoRepository.editComment(commentId, newContent);
  }

  public async deleteComment(commentId: string): Promise<string> {
    return this.videoRepository.deleteComment(commentId);
  }

  public async uploadVideo(
    key: string,
    body: Buffer,
    videoId: string
  ): Promise<string> {
    try {
      const jobId = await this.fileStorage.uploadVideo(key, body, videoId);
      const videoExist = await this.videoRepository.videoInformationExist(key);
      const videoInformation: VideoInformation = {
        postId: videoId,
        res360p: `/video/${videoId}/convert/HLS/${videoId}_360.m3u8`,
        res480p: `/video/${videoId}/convert/HLS/${videoId}_480.m3u8`,
        res720p: `/video/${videoId}/convert/HLS/${videoId}_720.m3u8`,
        res1080p: `/video/${videoId}/convert/HLS/${videoId}_1080.m3u8`,
        videoOriginalPath: key,
        mediaConverterJobId: jobId
      };
      if (!videoExist) {
        await this.videoRepository.createVideoInformation(videoInformation);
      } else {
        await this.videoRepository.updateVideoInformation(
          videoInformation,
          videoExist
        );
      }
      return this.storeVideoPath(videoId, key);
    } catch (error) {
      throw new AuthenticationError(
        ERROR_CODE.GAME_NOT_FOUND,
        `Game is not found` + error
      );
    }
  }

  public async storeVideoPath(
    videoId: string,
    videoPath: string
  ): Promise<string> {
    return await this.videoRepository.updateVideoPath(videoId, videoPath);
  }

  public async getPostsByUserId(
    userId: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<VideoPost>> {
    const findPostByUserIdQuery: VideoPostQuery = {
      userId: userId,
      status: PostStatus.PUBLISHED,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    return this.videoRepository.getPostsByUserId(findPostByUserIdQuery);
  }

  public async getVideoURLs(key: string): Promise<Array<string>> {
    return await this.videoRepository.getVideoURLs(key);
  }

  public async getThumbnail(videoPostId: string): Promise<string> {
    const conversionStatus = await this.videoRepository.checkVideoConversion(
      videoPostId
    );
    if (!conversionStatus) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Video with viodePostId: ${videoPostId} has not finish conversion yet.`
      );
    }
    return (
      DISTRIBUTED_URL +
      '/video/' +
      videoPostId +
      '/convert/Thumbnails/' +
      videoPostId +
      'Thumbnails.0000000.jpg'
    );
  }

  // public async getVideoURL(key: string): Promise<string> {
  //   return await this.fileStorage.uploadvr(key);
  // }

  // public async updateGameMention(
  //   postId: string,
  //   gameName: string[]
  // ): Promise<string> {
  //   const gameMention: PostQuery = {
  //     id: postId,
  //     gameMention: gameName
  //   };
  //   const posts = await this.videoRepository.updateGameMention(gameMention);
  //   if (!posts) {
  //     throw new NotFoundError(
  //       ERROR_CODE.USER_NOT_FOUND,
  //       `Post with PostId: ${postId} does not exist.`
  //     );
  //   }
  //   return posts;
  // }
}
