import FollowingStatus from '../auth/following-status';
import LoginUser from '../auth/login-user';
import { UserQuery } from '../auth/user-query';
import Comment from '../comments/comment';
import SubComment from '../comments/sub-comment';
import { CommentQuery } from '../comments/comment-query';
import VideoPost from './video';
import { VideoPostQuery } from './videopost-query';
import { VideoInformation } from './video-information';

export interface IVideoRepository {
  ///updateGameMention(gameMention: PostQuery): Promise<string | undefined>;
  createVideoPost(videoPost: VideoPost): Promise<string>;
  authorize(postId: string, userId: string): Promise<boolean>;
  getCommentById(commentQuery: CommentQuery): Promise<Comment | undefined>;
  checkUserEditCommentAuthorization(
    commentId: string,
    userId: string
  ): Promise<boolean>;
  getPostById(videoPostQuery: VideoPostQuery): Promise<VideoPost | undefined>;
  editVideoPost(post: VideoPost): Promise<string>;
  publishVideoPost(postId: string): Promise<string>;
  deleteVideoPost(postId: string): Promise<string>;
  createCommentToVideoPost(comment: Comment): Promise<string>;
  createSubCommentToComment(subComment: SubComment): Promise<string>;
  getCommentById(commentQuery: CommentQuery): Promise<Comment | undefined>;
  queryCommentsByVideoPost(postQuery: VideoPostQuery): Promise<Array<Comment>>;
  queryPostsByTitle(postQuery: VideoPostQuery): Promise<Array<VideoPost>>;
  queryPostsByUserId(postQuery: VideoPostQuery): Promise<Array<VideoPost>>;
  getExistedComment(commentQuery: CommentQuery): Promise<Comment | undefined>;
  editComment(id: string, content: string): Promise<string>;
  deleteComment(commentId: string): Promise<string>;
  getPostsByUserId(videoPostQuery: VideoPostQuery): Promise<Array<VideoPost>>;
  updateVideoPath(videoId: string, videoPath: string): Promise<string>;
  videoInformationExist(videoOriginalPath: string): Promise<string | undefined>;
  createVideoInformation(videoInformation: VideoInformation): Promise<void>;
  updateVideoInformation(
    videoInformation: VideoInformation,
    id: string
  ): Promise<void>;
  getVideoURLs(key: string): Promise<Array<string>>;
  checkVideoConversion(videoPostId: string): Promise<boolean>;
}
