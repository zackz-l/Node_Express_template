import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';

export default class FollowUserRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  followingId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  constructor(request: Request) {
    super();
    const { followingId } = request.params;
    const id = request.get(USER_ID)!;
    this.followingId = followingId;
    this.userId = id;
  }
}
