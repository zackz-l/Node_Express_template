import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';
import Comment from '../../../domain/aggregates/comments/comment';

export default class CreateCommentToPostRequest extends APIRequest {
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

  constructor(request: Request) {
    super();
    this.userId = request.get(USER_ID)!;
    const { postId } = request.params;
    const { content } = request.body;
    this.postId = postId;
    this.content = content;
  }

  toComment() {
    return new Comment(this.userId, this.postId, this.content);
  }
}
