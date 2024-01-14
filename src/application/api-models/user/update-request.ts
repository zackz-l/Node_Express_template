import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class ChangePasswordRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  constructor(request: Request) {
    super();
    const { password } = request.body;
    const { id } = request.params;
    this.password = password;
    this.userId = id;
  }
}
