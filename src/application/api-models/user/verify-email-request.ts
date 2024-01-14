import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class VerifyEmailRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  token: string;

  constructor(request: Request) {
    super();
    this.token = request.query.token as string;
  }
}
