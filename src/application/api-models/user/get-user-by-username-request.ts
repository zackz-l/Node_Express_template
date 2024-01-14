import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class GetUserByUsernameRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  username: string;

  constructor(request: Request) {
    super();
    const { username } = request.params;
    this.username = username;
  }
}
