import { IsArray, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class RemoveGameMentionRequest extends APIRequest {
  @IsArray()
  @IsDefined()
  @IsNotEmpty()
  gameName: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  postId: string;

  constructor(request: Request) {
    super();
    const { gameName } = request.body;
    const { postId } = request.params;
    this.postId = postId;
    this.gameName = gameName;
  }
}
