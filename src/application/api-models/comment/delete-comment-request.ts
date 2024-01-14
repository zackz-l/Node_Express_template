import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class DeleteCommentRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  commentId: string;

  constructor(request: Request) {
    super();
    const { postId } = request.params;
    const { commentId } = request.params;
    this.postId = postId;
    this.commentId = commentId;
  }
}
