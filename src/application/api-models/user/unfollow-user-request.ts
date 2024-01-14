import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';

export default class UnfollowUserRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  unfollowId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  constructor(request: Request) {
    super();
    const { unfollowId } = request.params;
    const id = request.get(USER_ID)!;
    this.unfollowId = unfollowId;
    this.userId = id;
  }
}
