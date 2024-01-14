import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class EditCommentRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  constructor(request: Request) {
    super();
    const { content } = request.body;
    const { commentId } = request.params;
    this.id = commentId;
    this.content = content;
  }
}
