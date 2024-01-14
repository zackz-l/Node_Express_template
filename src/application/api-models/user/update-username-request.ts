import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';

export default class UpdateUsernameRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  constructor(request: Request) {
    super();
    const { username } = request.body;
    const id = request.get(USER_ID)!;
    this.username = username;
    this.userId = id;
  }
}
