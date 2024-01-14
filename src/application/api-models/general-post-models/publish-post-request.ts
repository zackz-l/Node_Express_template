import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';

export default class PublishPostRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  constructor(request: Request) {
    super();
    const { postId } = request.params;
    this.userId = request.get(USER_ID)!;
    this.postId = postId;
  }
}
