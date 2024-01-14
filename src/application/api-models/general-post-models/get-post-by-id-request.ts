import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class GetPostByIdRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  postId: string;

  constructor(request: Request) {
    super();
    const { postId } = request.params;
    this.postId = postId;
  }
}
