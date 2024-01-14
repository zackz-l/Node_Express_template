import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { IFileStorage } from '../../domain/contracts/file-storage';
import TYPES from '../../domain/constants/types';
import VideoService from '../../domain/services/video';
import CreateVideoPostRequest from '../api-models/video/create-videopost-request';
import authenticate from '../middlewares/authenticate';
import videoAuthorize from '../middlewares/video-authorize';
import EditPostRequest from '../api-models/video/edit-videopost-request';
import PublishPostRequest from '../api-models/general-post-models/publish-post-request';
import DeletePostRequest from '../api-models/general-post-models/delete-post-request';
import GetVideoPostResponse from '../api-models/video/get-videopost-response';
import CreateCommentToPostRequest from '../api-models/comment/create-comment-to-post-request';
import CreateSubCommentToCommentRequest from '../api-models/comment/create-subComment-to-comment-request';
import QueryCommentsByPostRequest from '../api-models/general-post-models/query-comments-by-post-request';
import QueryCommentsByPostResponse from '../api-models/video/query-comments-by-post-response';
import editCommentAuthorize from '../middlewares/edit-comment-authorize';
import QueryPostByTitleRequest from '../api-models/general-post-models/query-post-by-title-request';
import EditCommentRequest from '../api-models/comment/edit-comment-request';
import QueryVideoPostsResponse from '../api-models/video/query-videopost-response';
import DeleteCommentRequest from '../api-models/comment/delete-comment-request';
import QueryPostByUserIdRequest from '../api-models/general-post-models/query-post-by-userId-request';
import multerBodyParser from '../middlewares/multer';
import gameOperationAuthorize from '../middlewares/game-authorize';
import UploadVideoPostRequest from '../api-models/video/upload-video-post-reuqesst';
import GetVideoURLsRequest from '../api-models/video/get-videoURL-request';
import GetVideoThumbnailRequest from '../api-models/video/get-videothumbnail-request';
import GetVideoPostByIdRequest from '../api-models/video/get-videopostid-request';

@controller('/videos')
export default class VideoController {
  constructor(
    @inject(VideoService)
    private readonly videoService: VideoService,
    @inject(TYPES.FileStorage)
    private readonly fileStorage: IFileStorage
  ) {}

  @httpPost('/')
  public async createVideoPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const createVideoPostRequest = await new CreateVideoPostRequest(
      request
    ).validate();
    const createdVideoPostId = await this.videoService.createVideoPost(
      createVideoPostRequest.toPost()
    );
    response.status(HttpStatusCode.CREATED).json({ id: createdVideoPostId });
  }

  @httpPatch('/:postId', authenticate, videoAuthorize)
  public async editVideoPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const editVideoPostRequest = await new EditPostRequest(request).validate();
    const videoPost = editVideoPostRequest.toPost();
    const videoPostId = await this.videoService.editVideoPost(videoPost);
    response.status(HttpStatusCode.OK).json({ id: videoPostId });
  }

  @httpPatch('/:postId/publish', authenticate, videoAuthorize)
  public async publishVideoPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const publishVideoPostRequest = await new PublishPostRequest(
      request
    ).validate();
    const { postId, userId } = publishVideoPostRequest;
    const publishedVideoPostId = await this.videoService.publishVideoPost(
      postId,
      userId
    );
    response.status(HttpStatusCode.OK).json({ id: publishedVideoPostId });
  }

  @httpDelete('/:postId', authenticate, videoAuthorize)
  public async deleteVideoPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const deleteVideoPostRequest = await new DeletePostRequest(
      request
    ).validate();
    const { postId, userId } = deleteVideoPostRequest;
    const deletedVideoPostId = await this.videoService.deleteVideoPost(
      postId,
      userId
    );
    response.status(HttpStatusCode.OK).json({ id: deletedVideoPostId });
  }

  @httpGet('/:videoPostId')
  public async getVideoPostById(
    request: Request,
    response: Response
  ): Promise<void> {
    const getUserIdRequest = await new GetVideoPostByIdRequest(
      request
    ).validate();
    const { videoPostId } = getUserIdRequest;
    const videoPost = await this.videoService.getPostById(videoPostId);
    response
      .status(HttpStatusCode.OK)
      .json(GetVideoPostResponse.fromPost(videoPost));
  }

  @httpPost('/:postId/comments', authenticate)
  public async createCommentToVideoPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const createCommentToPostRequest = await new CreateCommentToPostRequest(
      request
    ).validate();
    const createdCommentId = await this.videoService.createCommentToVideoPost(
      createCommentToPostRequest.toComment()
    );
    response.status(HttpStatusCode.CREATED).json({ id: createdCommentId });
  }

  @httpPost('/:postId/comments/:parentCommentId/add-comment', authenticate)
  public async createSubCommentToComment(
    request: Request,
    response: Response
  ): Promise<void> {
    const createSubCommentToCommentRequest =
      await new CreateSubCommentToCommentRequest(request).validate();
    const createdCommentId = await this.videoService.createSubCommentToComment(
      createSubCommentToCommentRequest.toSubComment(),
      createSubCommentToCommentRequest.postId
    );
    response.status(HttpStatusCode.CREATED).json({ id: createdCommentId });
  }

  @httpGet('/:postId/comments')
  public async queryCommentsByVideoPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const queryCommentsByPostRequest = await new QueryCommentsByPostRequest(
      request
    ).validate();
    const { postId, pageIndex, pageLimit } = queryCommentsByPostRequest;
    const comments = await this.videoService.queryCommentsByVideoPost(
      postId,
      pageIndex,
      pageLimit
    );
    response
      .status(HttpStatusCode.OK)
      .json(QueryCommentsByPostResponse.fromComments(comments));
  }

  @httpGet('/title/search')
  public async queryVideoPostByTitle(
    request: Request,
    response: Response
  ): Promise<void> {
    const queryPostsByTitleRequest = await new QueryPostByTitleRequest(
      request
    ).validate();
    const { title, pageIndex, pageLimit } = queryPostsByTitleRequest;
    const posts = await this.videoService.queryPostsByTitle(
      title,
      pageIndex,
      pageLimit
    );
    const queryPosts = QueryVideoPostsResponse.fromPosts(posts);
    response.status(HttpStatusCode.OK).json(queryPosts);
  }

  @httpPatch('/:postId/comments/:commentId', authenticate, editCommentAuthorize)
  public async editCommentByCommentId(
    request: Request,
    response: Response
  ): Promise<void> {
    const editCommentRequest = await new EditCommentRequest(request).validate();
    const { content, id } = editCommentRequest;
    const editedCommentId = await this.videoService.editComment(id, content);
    response.status(HttpStatusCode.OK).json({ id: editedCommentId });
  }

  @httpDelete(
    '/:postId/comments/:commentId',
    authenticate,
    editCommentAuthorize
  )
  public async deleteComment(
    request: Request,
    response: Response
  ): Promise<void> {
    const deleteCommentRequest = await new DeleteCommentRequest(
      request
    ).validate();
    const { postId, commentId } = deleteCommentRequest;
    const deletedCommentId = await this.videoService.deleteComment(commentId);
    response.status(HttpStatusCode.OK).json({ id: deletedCommentId });
  }

  @httpGet('/:userId/title/search')
  public async queryVideoPostByUserId(
    request: Request,
    response: Response
  ): Promise<void> {
    const queryPostsByUserIdRequest = await new QueryPostByUserIdRequest(
      request
    ).validate();
    const { userId, title, pageIndex, pageLimit } = queryPostsByUserIdRequest;
    const posts = await this.videoService.queryPostsByUserId(
      userId,
      title,
      pageIndex,
      pageLimit
    );
    const queryPosts = QueryVideoPostsResponse.fromPosts(posts);
    response.status(HttpStatusCode.OK).json(queryPosts);
  }

  @httpPost('/:videoId/uploadVideo', multerBodyParser.single('video'))
  public async uploadVideo(
    request: Request,
    response: Response
  ): Promise<void> {
    const uploadJsonfileRequest = await new UploadVideoPostRequest(
      request
    ).validate();
    const storedGameId = await this.videoService.uploadVideo(
      uploadJsonfileRequest.toVideoPath(),
      uploadJsonfileRequest.videoBuffer,
      uploadJsonfileRequest.videoId
    );
    response.status(HttpStatusCode.CREATED).json({ id: storedGameId });
  }

  @httpGet('/:videoPostId/getUploadedVideoURLs')
  public async getVideoURLs(
    request: Request,
    response: Response
  ): Promise<void> {
    const getVideoURLRequest = await new GetVideoURLsRequest(
      request
    ).validate();
    var { videoPostId } = getVideoURLRequest;
    const URL = await this.videoService.getVideoURLs(videoPostId);
    response.status(HttpStatusCode.CREATED).json({ signedUrl: URL });
  }

  @httpGet('/:videoPostId/videoThumbnail')
  public async getThumbnail(
    request: Request,
    response: Response
  ): Promise<void> {
    const getVideoThumbnailRequest = await new GetVideoThumbnailRequest(
      request
    ).validate();
    var { videoPostId } = getVideoThumbnailRequest;
    const videoThumbnail = await this.videoService.getThumbnail(videoPostId);
    response.status(HttpStatusCode.OK).json({ thumbNail: videoThumbnail });
  }

  // @httpGet('/:key/getUploadedVideoURL')
  // public async getVideoURL(
  //   request: Request,
  //   response: Response
  // ): Promise<void> {
  //   const getVideoURLRequest = await new GetVideoURLRequest(request).validate();
  //   var { key } = getVideoURLRequest;
  //   key = 'video/' + key + '.mp4';
  //   const URL = await this.videoService.getVideoURL(key);
  //   response.status(HttpStatusCode.CREATED).json({ signedUrl: URL });
  // }

  // @httpPatch('/:postId/saveGameMention')
  // public async savePostWithGameMention(
  //   request: Request,
  //   response: Response
  // ): Promise<void> {
  //   const savePostWithGameMentionRequest = await new savePostWithGameMention(
  //     request
  //   ).validate();
  //   const { gameName, postId } = savePostWithGameMentionRequest;
  //   const savePostWithMention = await this.videoService.updateGameMention(
  //     postId,
  //     gameName
  //   );
  //   response.status(HttpStatusCode.OK).json({ postId: savePostWithMention });
  // }
}
