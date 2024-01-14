import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost
} from 'inversify-express-utils';
import CreatePostRequest from '../api-models/article/create-post-request';
import EditPostRequest from '../api-models/article/edit-post-request';
import PublishPostRequest from '../api-models/general-post-models/publish-post-request';
import DeletePostRequest from '../api-models/general-post-models/delete-post-request';
import GetPostByIdRequest from '../api-models/general-post-models/get-post-by-id-request';
import GetPostResponse from '../api-models/article/get-post-response';
import CreateCommentToPostRequest from '../api-models/comment/create-comment-to-post-request';
import CreateSubCommentToCommentRequest from '../api-models/comment/create-subComment-to-comment-request';
import QueryCommentsByPostRequest from '../api-models/general-post-models/query-comments-by-post-request';
import EditCommentRequest from '../api-models/comment/edit-comment-request';
import QueryPostByTitleRequest from '../api-models/general-post-models/query-post-by-title-request';
import QueryPostByUserIdRequest from '../api-models/general-post-models/query-post-by-userId-request';
import DeleteCommentRequest from '../api-models/comment/delete-comment-request';
import PostService from '../../domain/services/article';
import { inject } from 'inversify';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/post-authorize';
import QueryCommentsByPostResponse from '../api-models/video/query-comments-by-post-response';
import editCommentAuthorize from '../middlewares/edit-comment-authorize';
import QueryPostsResponse from '../api-models/article/query-post-response';
import multerBodyParser from '../middlewares/multer';
import UploadPostImageRequest from '../api-models/general-post-models/upload-post-image-request';
import { IFileStorage } from '../../domain/contracts/file-storage';
import TYPES from '../../domain/constants/types';
import SavePostWithGameMention from '../api-models/general-post-models/save-post-with-game-mention-request';
import RemoveGameMentionRequest from '../api-models/general-post-models/remove-game-mention-request';
import GetArticlesAndVideosRequest from '../api-models/general-post-models/get-articles-and-video-request';
import RemoveImageFromArticleRequest from '../api-models/article/remove-image-from-article-request';

@controller('/posts')
export default class PostController {
  constructor(
    @inject(PostService)
    private readonly postService: PostService,
    @inject(TYPES.FileStorage)
    private readonly fileStorage: IFileStorage
  ) {}

  @httpPost('/')
  public async createPost(request: Request, response: Response): Promise<void> {
    const createPostRequest = await new CreatePostRequest(request).validate();
    const createdPostId = await this.postService.createPost(
      createPostRequest.toPost()
    );
    response.status(HttpStatusCode.CREATED).json({ id: createdPostId });
  }

  @httpPatch('/:postId', authenticate, authorize)
  public async editPost(request: Request, response: Response): Promise<void> {
    const editPostRequest = await new EditPostRequest(request).validate();
    const post = editPostRequest.toPost();
    const postId = await this.postService.editPost(post);
    response.status(HttpStatusCode.OK).json({ id: postId });
  }

  @httpPatch('/:postId/publish', authenticate, authorize)
  public async publishPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const publishPostRequest = await new PublishPostRequest(request).validate();
    const { postId, userId } = publishPostRequest;
    const publishedPostId = await this.postService.publishPost(postId, userId);
    response.status(HttpStatusCode.OK).json({ id: publishedPostId });
  }

  @httpDelete('/:postId', authenticate, authorize)
  public async deletePost(request: Request, response: Response): Promise<void> {
    const deletePostRequest = await new DeletePostRequest(request).validate();
    const { postId, userId } = deletePostRequest;
    const deletedPostId = await this.postService.deletePost(postId, userId);
    response.status(HttpStatusCode.OK).json({ id: deletedPostId });
  }

  @httpGet('/:postId')
  public async getpostById(
    request: Request,
    response: Response
  ): Promise<void> {
    const getUserIdRequest = await new GetPostByIdRequest(request).validate();
    const { postId } = getUserIdRequest;
    const post = await this.postService.getPostById(postId);
    response.status(HttpStatusCode.OK).json(GetPostResponse.fromPost(post));
  }

  @httpPost('/:postId/comments', authenticate)
  public async createCommentToPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const createCommentToPostRequest = await new CreateCommentToPostRequest(
      request
    ).validate();
    const createdCommentId = await this.postService.createCommentToPost(
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
    const createdCommentId = await this.postService.createSubCommentToComment(
      createSubCommentToCommentRequest.toSubComment(),
      createSubCommentToCommentRequest.postId
    );
    response.status(HttpStatusCode.CREATED).json({ id: createdCommentId });
  }

  @httpGet('/:postId/comments')
  public async queryCommentsByPost(
    request: Request,
    response: Response
  ): Promise<void> {
    const queryCommentsByPostRequest = await new QueryCommentsByPostRequest(
      request
    ).validate();
    const { postId, pageIndex, pageLimit } = queryCommentsByPostRequest;
    const comments = await this.postService.queryCommentsByPost(
      postId,
      pageIndex,
      pageLimit
    );
    response
      .status(HttpStatusCode.OK)
      .json(QueryCommentsByPostResponse.fromComments(comments));
  }

  @httpGet('/title/search')
  public async queryPostByTitle(
    request: Request,
    response: Response
  ): Promise<void> {
    const queryPostsByTitleRequest = await new QueryPostByTitleRequest(
      request
    ).validate();
    const { title, pageIndex, pageLimit } = queryPostsByTitleRequest;
    const posts = await this.postService.queryPostsByTitle(
      title,
      pageIndex,
      pageLimit
    );
    const queryPosts = QueryPostsResponse.fromPosts(posts);
    response.status(HttpStatusCode.OK).json(queryPosts);
  }

  @httpPatch('/:postId/comments/:commentId', authenticate, editCommentAuthorize)
  public async editCommentByCommentId(
    request: Request,
    response: Response
  ): Promise<void> {
    const editCommentRequest = await new EditCommentRequest(request).validate();
    const { content, id } = editCommentRequest;
    const editedCommentId = await this.postService.editComment(id, content);
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
    const deletedCommentId = await this.postService.deleteComment(commentId);
    response.status(HttpStatusCode.OK).json({ id: deletedCommentId });
  }

  @httpPatch('/:postId/uploadImage', multerBodyParser.single('postImage'))
  public async uploadImage(
    request: Request,
    response: Response
  ): Promise<void> {
    const uploadPostImageRequest = await new UploadPostImageRequest(
      request
    ).validate();
    const storedpostId = await this.postService.uploadPostImage(
      uploadPostImageRequest.postId,
      uploadPostImageRequest.toPostPath(),
      uploadPostImageRequest.imageBuffer
    );
    response.status(HttpStatusCode.OK).json({ id: storedpostId });
  }

  @httpGet('/:userId/title/search')
  public async queryPostByUserId(
    request: Request,
    response: Response
  ): Promise<void> {
    const queryPostsByUserIdRequest = await new QueryPostByUserIdRequest(
      request
    ).validate();
    const { userId, title, pageIndex, pageLimit } = queryPostsByUserIdRequest;
    const posts = await this.postService.queryPostsByUserId(
      userId,
      title,
      pageIndex,
      pageLimit
    );
    const queryPosts = QueryPostsResponse.fromPosts(posts);
    response.status(HttpStatusCode.OK).json(queryPosts);
  }

  @httpPatch('/:postId/saveGameMention')
  public async savePostWithGameMention(
    request: Request,
    response: Response
  ): Promise<void> {
    const savePostWithGameMentionRequest = await new SavePostWithGameMention(
      request
    ).validate();
    const { gameName, postId } = savePostWithGameMentionRequest;
    const addedGameMentionInformation = await this.postService.addGameMention(
      postId,
      gameName
    );
    response
      .status(HttpStatusCode.OK)
      .json({ gameMentionoInformation: addedGameMentionInformation });
  }

  @httpPatch('/:postId/removeGameMention')
  public async removeGameMentionFromArticle(
    request: Request,
    response: Response
  ): Promise<void> {
    const removeGameMentionRequest = await new RemoveGameMentionRequest(
      request
    ).validate();
    const { gameName, postId } = removeGameMentionRequest;
    const savePostWithMention = await this.postService.removeGameMention(
      postId,
      gameName
    );
    response.status(HttpStatusCode.OK).json({ postId: savePostWithMention });
  }

  @httpGet('/search/articlesAndVideo')
  public async getAllArticlesAndVideos(
    request: Request,
    response: Response
  ): Promise<void> {
    const getAllArticlesAndVideosRequest =
      await new GetArticlesAndVideosRequest(request).validate();
    const { title, pageIndex, pageLimit } = getAllArticlesAndVideosRequest;
    const allPosts = await this.postService.getAllArticlesAndVideos(
      title,
      pageIndex,
      pageLimit
    );
    response.status(HttpStatusCode.OK).json({ allPosts: allPosts });
  }

  @httpPatch('/:postId/:imagePath/removeImage')
  public async removeImageFromArticle(
    request: Request,
    response: Response
  ): Promise<void> {
    const removeImageFromArticle = await new RemoveImageFromArticleRequest(
      request
    ).validate();
    const { articleId, imagePath } = removeImageFromArticle;
    const postId = await this.postService.removeImageFromArticle(
      articleId,
      imagePath
    );
    response.status(HttpStatusCode.OK).json({ id: postId });
  }
}
