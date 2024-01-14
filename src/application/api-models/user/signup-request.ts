import {
  IsAlphanumeric,
  IsDefined,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength
} from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import SignupUser from '../../../domain/aggregates/auth/signup-user';
import { generateUsername } from '../../../infrastructure/unique-name-generator/username-generator';

export default class SignupRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(16)
  username: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  email: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  constructor(request: Request) {
    super();
    const { username, email, password } = request.body;
    this.username = username || generateUsername().substring(0, 16);
    this.email = email;
    this.password = password;
  }

  toSignupUser() {
    return new SignupUser(this.username, this.email, this.password);
  }
}
