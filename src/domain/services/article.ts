import { IPostRepository } from '../aggregates/articles/article-repository';
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
import GameMention from '../aggregates/game-provider/game-mention';
import ArticlesAndVideos from '../aggregates/articles-and-videos';

@injectable()
export default class PostService {
  constructor(
    @inject(TYPES.PostRepository)
    private readonly postRepository: IPostRepository,
    @inject(TYPES.FileStorage)
    private readonly fileStorage: IFileStorage
  ) {}

  public async createPost(post: Post): Promise<string> {
    return this.postRepository.createPost(post);
  }

  public async authorize(postId: string, userId: string): Promise<string> {
    const authorized = await this.postRepository.authorize(postId, userId);
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
    const existComment = await this.postRepository.getCommentById(commentQuery);
    if (!existComment) {
      throw new AuthorizationError(
        ERROR_CODE.UNAUTHORIZED_OPERATION,
        `No such comment with commentId: ${commentId}.`
      );
    }
    const authorized =
      await this.postRepository.checkUserEditCommentAuthorization(
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

  public async editPost(post: Post): Promise<string> {
    const postQuery: PostQuery = { id: post.id };
    const editPost = await this.postRepository.getPostById(postQuery);
    if (!editPost) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `User with userId: ${post.userId} is trying to edit non-existing post with postId: ${post.id}.`
      );
    }
    return this.postRepository.editPost(post);
  }

  public async publishPost(postId: string, userId: string): Promise<string> {
    const postQuery: PostQuery = { id: postId };
    const publishPost = await this.postRepository.getPostById(postQuery);
    if (!publishPost) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `User with userId: ${userId} is trying to publish non-existing post with postId: ${postId}.`
      );
    }
    return this.postRepository.publishPost(postId);
  }

  public async deletePost(postId: string, userId: string): Promise<string> {
    const deletePostQuery: PostQuery = { id: postId };
    const deletePost = await this.postRepository.getPostById(deletePostQuery);
    if (!deletePost) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `User with userId: ${userId} is trying to delete non-existing post with postId: ${postId}.`
      );
    }
    return this.postRepository.deletePost(postId);
  }

  public async getPostById(postId: string): Promise<Post> {
    const getPostByIdQuery: PostQuery = { id: postId };
    const post = await this.postRepository.getPostById(getPostByIdQuery);
    if (!post) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Post with Id: ${postId} does not exist.`
      );
    }
    return post;
  }

  public async createCommentToPost(comment: Comment): Promise<string> {
    const postQuery: PostQuery = { id: comment.postId };
    const post = await this.postRepository.getPostById(postQuery);
    if (!post) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `User with userId: ${comment.userId} is trying to comment on non-existing post with postId: ${comment.postId}.`
      );
    }
    return this.postRepository.createCommentToPost(comment);
  }

  public async createSubCommentToComment(
    subComment: SubComment,
    postId: string
  ): Promise<string> {
    const commentQuery: CommentQuery = {
      id: subComment.parentCommentId
    };
    const parentComment = await this.postRepository.getCommentById(
      commentQuery
    );
    if (!parentComment || parentComment.postId !== postId) {
      throw new NotFoundError(
        ERROR_CODE.COMMENT_NOT_FOUND,
        `User with userId: ${subComment.userId} is trying to comment on non-existing comment with commentId: ${subComment.parentCommentId}.`
      );
    }
    return this.postRepository.createSubCommentToComment(subComment);
  }

  public async queryCommentsByPost(
    postId: string,
    pageIndex: number,
    pageLimit: number
  ): Promise<Comment[]> {
    const postQuery: PostQuery = {
      id: postId,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    const post = await this.postRepository.getPostById(postQuery);
    if (!post) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Post trying to get comments with postId: ${postId} does not exist.`
      );
    }
    return this.postRepository.queryCommentsByPost(postQuery);
  }

  public async queryPostsByTitle(
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<Post>> {
    const findPostByTitleQuery: PostQuery = {
      title: title,
      status: PostStatus.PUBLISHED,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    return this.postRepository.queryPostsByTitle(findPostByTitleQuery);
  }

  public async queryPostsByUserId(
    userId: string,
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<Post>> {
    const findPostByUserIdQuery: PostQuery = {
      userId: userId,
      title: title,
      status: PostStatus.PUBLISHED,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    return this.postRepository.queryPostsByUserId(findPostByUserIdQuery);
  }

  public async editComment(
    commentId: string,
    newContent: string
  ): Promise<string> {
    const getExistedComment: CommentQuery = {
      id: commentId
    };
    const existedComment =
      this.postRepository.getExistedComment(getExistedComment);
    if (!existedComment) {
      throw new NotFoundError(
        ERROR_CODE.COMMENT_NOT_FOUND,
        `Comment trying to get comments with commentId: ${commentId} does not exist.`
      );
    }
    return this.postRepository.editComment(commentId, newContent);
  }

  public async deleteComment(commentId: string): Promise<string> {
    return this.postRepository.deleteComment(commentId);
  }

  public async uploadPostImage(
    postId: string,
    imagePath: string,
    imageBuffer: Buffer
  ): Promise<string> {
    const post = await this.postRepository.getPostById({ id: postId });
    if (!post) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Post with postId: ${postId} not found.`
      );
    }

    await this.fileStorage.uploadPostImage(imagePath, imageBuffer);
    await this.postRepository.addPostImage(postId, imagePath);
    return postId;
  }

  public async getPostsByUserId(
    userId: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<Post>> {
    const findPostByUserIdQuery: PostQuery = {
      userId: userId,
      status: PostStatus.PUBLISHED,
      pageIndex: pageIndex,
      pageLimit: pageLimit
    };
    return this.postRepository.getPostsByUserId(findPostByUserIdQuery);
  }

  public async addGameMention(
    postId: string,
    gameName: string
  ): Promise<GameMention> {
    const gameMention: PostQuery = {
      id: postId,
      gameMention: gameName
    };
    const gameInformation =
      await this.postRepository.queryGameMentionInformation(gameMention);
    if (!gameInformation) {
      throw new NotFoundError(
        ERROR_CODE.USER_NOT_FOUND,
        `Game with GameName: ${gameName} does not exist.`
      );
    }
    const posts = await this.postRepository.addGameMention(gameMention);
    if (!posts) {
      throw new NotFoundError(
        ERROR_CODE.USER_NOT_FOUND,
        `Post with PostId: ${postId} does not exist.`
      );
    }
    return gameInformation!;
  }

  public async removeGameMention(
    articleId: string,
    gameName: string
  ): Promise<string> {
    const article: PostQuery = {
      id: articleId,
      gameMention: gameName
    };
    var articleExist = await this.postRepository.getPostById(article);
    if (!articleExist) {
      throw new NotFoundError(
        ERROR_CODE.USER_NOT_FOUND,
        `article with Id: ${articleId} does not exist.`
      );
    }
    article.gameMentions = articleExist.gameName!.filter(
      (gameName) => gameName !== article.gameMention
    );
    articleId = await this.postRepository.updateGameMentions(article);
    return articleId;
  }

  public async getAllArticlesAndVideos(
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<ArticlesAndVideos>> {
    var articles = await this.postRepository.getArticles(
      title,
      pageIndex,
      pageLimit
    );
    var vidoes = await this.postRepository.getVideos(
      title,
      pageIndex,
      pageLimit
    );
    var articlesAndVideos = articles.concat(vidoes);
    articlesAndVideos = articlesAndVideos.sort((a, b) => {
      return a.createdDate.valueOf() - b.createdDate.valueOf();
    });
    return articlesAndVideos;
  }

  public async removeImageFromArticle(
    articleId: string,
    imagePath: string
  ): Promise<string> {
    const post = await this.postRepository.getPostById({ id: articleId });
    if (!post) {
      throw new NotFoundError(
        ERROR_CODE.POST_NOT_FOUND,
        `Post with postId: ${articleId} not found.`
      );
    }
    await this.fileStorage.removeImageFromS3(imagePath);
    let images = await this.postRepository.queryArticleImages(articleId);
    images.filter((image) => image !== imagePath);
    await this.postRepository.updateImagePaths(articleId, images);
    return post.id!;
  }
}
