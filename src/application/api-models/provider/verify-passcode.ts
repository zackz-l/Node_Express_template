import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class VerifyPasscodeRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  passcode: string;

  constructor(request: Request) {
    super();
    const { email, passcode } = request.body;
    this.email = email;
    this.passcode = passcode;
  }
}
