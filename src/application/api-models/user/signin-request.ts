import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class SigninRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(request: Request) {
    super();
    const { email, password } = request.body;
    this.email = email;
    this.password = password;
  }
}
