import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
} from "inversify-express-utils";
import { inject } from "inversify";
import { IFileStorage } from "../../domain/contracts/file-storage";
import TYPES from "../../domain/constants/types";
import VideoService from "../../domain/services/video";
import CreateVideoPostRequest from "../api-models/video/create-videopost-request";
import authenticate from "../middlewares/authenticate";
import videoAuthorize from "../middlewares/video-authorize";
import EditPostRequest from "../api-models/video/edit-videopost-request";
import GetVideoPostResponse from "../api-models/video/get-videopost-response";
import QueryCommentsByPostResponse from "../api-models/video/query-comments-by-post-response";
import QueryVideoPostsResponse from "../api-models/video/query-videopost-response";

import multerBodyParser from "../middlewares/multer";

import UploadVideoPostRequest from "../api-models/video/upload-video-post-reuqesst";
import GetVideoURLsRequest from "../api-models/video/get-videoURL-request";
import GetVideoThumbnailRequest from "../api-models/video/get-videothumbnail-request";
import GetVideoPostByIdRequest from "../api-models/video/get-videopostid-request";

@controller("/videos")
export default class VideoController {
  constructor(
    @inject(VideoService)
    private readonly videoService: VideoService,
    @inject(TYPES.FileStorage)
    private readonly fileStorage: IFileStorage
  ) {}

  @httpPost("/")
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

  @httpPatch("/:postId", authenticate, videoAuthorize)
  public async editVideoPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const editVideoPostRequest = await new EditPostRequest(request).validate();
    const videoPost = editVideoPostRequest.toPost();
    const videoPostId = await this.videoService.editVideoPost(videoPost);
    response.status(HttpStatusCode.OK).json({ id: videoPostId });
  }

  @httpGet("/:videoPostId")
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

  @httpPost("/:videoId/uploadVideo", multerBodyParser.single("video"))
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

  @httpGet("/:videoPostId/getUploadedVideoURLs")
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

  @httpGet("/:videoPostId/videoThumbnail")
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
}
