import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';
import SubComment from '../../../domain/aggregates/comments/sub-comment';

export default class CreateSubCommentToCommentRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  parentCommentId: string;

  constructor(request: Request) {
    super();
    this.userId = request.get(USER_ID)!;
    const { postId, parentCommentId } = request.params;
    const { content } = request.body;
    this.postId = postId;
    this.parentCommentId = parentCommentId;
    this.content = content;
  }

  toSubComment() {
    return new SubComment(this.userId, this.parentCommentId, this.content);
  }
}
