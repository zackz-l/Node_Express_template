import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';

export default class GetFollowingCountRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  constructor(request: Request) {
    super();
    const { userId } = request.params;
    this.userId = userId;
  }
}
