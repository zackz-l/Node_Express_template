import { IsDefined, IsNotEmpty, IsString, isUUID } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';

export default class DeleteRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  constructor(request: Request) {
    super();
    this.id = request.get(USER_ID)!;
  }
}
