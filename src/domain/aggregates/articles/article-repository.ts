import Post from './article';
import Comment from '../comments/comment';
import { PostQuery } from './article-query';
import { CommentQuery } from '../comments/comment-query';
import SubComment from '../comments/sub-comment';
import GameMention from '../game-provider/game-mention';
import ArticlesAndVideos from '../articles-and-videos';

export interface IPostRepository {
  addGameMention(gameMention: PostQuery): Promise<string>;
  updateGameMentions(gameMention: PostQuery): Promise<string>;
  queryGameMentionInformation(
    gameMention: PostQuery
  ): Promise<GameMention | undefined>;
  createPost(post: Post): Promise<string>;
  getPostById(postQuery: PostQuery): Promise<Post | undefined>;
  getCommentById(commentQuery: CommentQuery): Promise<Comment | undefined>;
  editPost(post: Post): Promise<string>;
  authorize(postId: string, userId: string): Promise<boolean>;
  publishPost(postId: string): Promise<string>;
  deletePost(postId: string): Promise<string>;
  createCommentToPost(comment: Comment): Promise<string>;
  queryPostsByTitle(postQuery: PostQuery): Promise<Array<Post>>;
  queryPostsByUserId(postQuery: PostQuery): Promise<Array<Post>>;
  checkUserEditCommentAuthorization(
    commentId: string,
    userId: string
  ): Promise<boolean>;
  editComment(id: string, content: string): Promise<string>;
  createSubCommentToComment(subComment: SubComment): Promise<string>;
  queryCommentsByPost(postQuery: PostQuery): Promise<Comment[]>;
  deleteComment(commentId: string): Promise<string>;
  getExistedComment(commentQuery: CommentQuery): Promise<Comment | undefined>;
  addPostImage(postId: string, postPath: string): Promise<void>;
  getPostsByUserId(postQuery: PostQuery): Promise<Array<Post>>;
  getArticles(
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<ArticlesAndVideos>>;
  getVideos(
    title: string | undefined,
    pageIndex: number,
    pageLimit: number
  ): Promise<Array<ArticlesAndVideos>>;
  queryArticleImages(articleId: string): Promise<Array<string>>;
  updateImagePaths(articleId: string, imagePaths: Array<string>): Promise<void>;
  getVideoURLs(id: string): Promise<Array<string>>;
}
