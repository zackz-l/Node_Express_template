import { IPostRepository } from '../../domain/aggregates/articles/article-repository';
import Post from '../../domain/aggregates/articles/article';
import Comment from '../../domain/aggregates/comments/comment';
import { injectable } from 'inversify';
import prisma from '../database/database';
import { PostQuery } from '../../domain/aggregates/articles/article-query';
import { CommentQuery } from '../../domain/aggregates/comments/comment-query';
import { PostStatus, VideoSlicingStatus } from '@prisma/client';
import SubComment from '../../domain/aggregates/comments/sub-comment';
import GameMention from '../../domain/aggregates/game-provider/game-mention';
import ArticlesAndVideos from '../../domain/aggregates/articles-and-videos';
import { contains, isNotEmpty } from 'class-validator';
import { DISTRIBUTED_URL } from '../../config/env-config';
import { AuthorizationError, ERROR_CODE, NotFoundError } from '../../errors';

@injectable()
export default class PostRepository implements IPostRepository {
  public async createPost(post: Post): Promise<string> {
    const createPost = await prisma.article.create({
      data: {
        title: post.title,
        content: post.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: post.userId!
      }
    });
    return createPost.id;
  }

  public async getPostById(postQuery: PostQuery): Promise<Post | undefined> {
    const post = await prisma.article.findUnique({
      where: {
        id: postQuery.id
      }
    });

    return post && !post.deletedAt
      ? new Post(
          post.title,
          post.content,
          post.userId,
          post.id,
          post.gameMention,
          post.imagePath,
          post.status
        )
      : undefined;
  }

  public async authorize(postId: string, userId: string): Promise<boolean> {
    const post = await prisma.article.findFirst({
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

  public async editPost(post: Post): Promise<string> {
    const editPost = await prisma.article.update({
      where: {
        id: post.id
      },
      data: {
        title: post.title,
        content: post.content,
        updatedAt: new Date(),
        gameMention: post.gameName,
        imagePath: post.imagePath
      }
    });
    return editPost.id;
  }

  public async publishPost(postId: string): Promise<string> {
    const post = await prisma.article.update({
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

  public async deletePost(postId: string): Promise<string> {
    const post = await prisma.article.update({
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
          comment.articleId!,
          comment.content,
          comment.id
        )
      : undefined;
  }

  public async createCommentToPost(comment: Comment): Promise<string> {
    const createdComment = await prisma.comment.create({
      data: {
        userId: comment.userId,
        articleId: comment.postId,
        content: comment.content
      }
    });

    const connectCommentToPost = await prisma.article.update({
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

  public async queryCommentsByPost(postQuery: PostQuery): Promise<Comment[]> {
    const comments = await prisma.comment.findMany({
      skip: postQuery.pageIndex! * postQuery.pageLimit!,
      take: postQuery.pageLimit!,
      where: {
        articleId: postQuery.id,
        deletedAt: null
      },
      include: {
        subComments: { where: { deletedAt: null } }
      }
    });
    return comments;
  }

  public async queryPostsByTitle(postQuery: PostQuery): Promise<Array<Post>> {
    const posts = await prisma.article.findMany({
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
      (post) => new Post(post.title, post.content, post.userId, post.id)
    );
  }

  public async queryPostsByUserId(postQuery: PostQuery): Promise<Array<Post>> {
    const posts = await prisma.article.findMany({
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
      (post) => new Post(post.title, post.content, post.userId, post.id)
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
          comment.articleId!,
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

  public async addPostImage(postId: string, imagePath: string): Promise<void> {
    await prisma.article.update({
      where: {
        id: postId
      },
      data: {
        imagePath: {
          push: imagePath
        }
      }
    });
  }

  public async getPostsByUserId(postQuery: PostQuery): Promise<Array<Post>> {
    const posts = await prisma.article.findMany({
      skip: postQuery.pageIndex! * postQuery.pageLimit!,
      take: postQuery.pageLimit,
      where: {
        userId: postQuery.userId,
        deletedAt: null,
        status: postQuery.status
      }
    });
    return posts.map(
      (post) => new Post(post.title, post.content, post.userId, post.id)
    );
  }

  public async updateGameMentions(postQuery: PostQuery): Promise<string> {
    const gameMentionPost = await prisma.article.update({
      where: {
        id: postQuery.id
      },
      data: {
        gameMention: postQuery.gameMentions
      }
    });
    return gameMentionPost.id;
  }

  public async queryGameMentionInformation(
    postQuery: PostQuery
  ): Promise<GameMention | undefined> {
    const gameInformattion = await prisma.gameInformation.findFirst({
      where: {
        name: postQuery.gameMention
      }
    });
    return gameInformattion
      ? new GameMention(
          gameInformattion.name,
          gameInformattion.gameIconImagePath
        )
      : undefined;
  }

  public async addGameMention(gameMention: PostQuery): Promise<string> {
    const article = await prisma.article.update({
      where: {
        id: gameMention.id
      },
      data: {
        gameMention: gameMention.gameMention
      }
    });
    return article.id;
  }

  public async getArticles(
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<ArticlesAndVideos[]> {
    const articles = await prisma.article.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive'
        },
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

  public async getVideos(
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<ArticlesAndVideos[]> {
    const videos = await prisma.videoPost.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive'
        },
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

  public async updateImagePaths(
    articleId: string,
    imagePaths: Array<string>
  ): Promise<void> {
    await prisma.article.update({
      where: {
        id: articleId
      },
      data: {
        imagePath: imagePaths
      }
    });
  }

  public async queryArticleImages(articleId: string): Promise<Array<string>> {
    const article = await prisma.article.findUnique({
      where: {
        id: articleId
      }
    });
    return article!.imagePath;
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
