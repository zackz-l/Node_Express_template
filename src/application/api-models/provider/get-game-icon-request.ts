import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class GetGameIconRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  gameId: string;

  constructor(request: Request) {
    super();
    const { gameId } = request.params;
    this.gameId = gameId;
  }
}
