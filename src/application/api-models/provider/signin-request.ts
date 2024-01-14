import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class ProviderSigninRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  constructor(request: Request) {
    super();
    const { email } = request.body;
    this.email = email;
  }
}
