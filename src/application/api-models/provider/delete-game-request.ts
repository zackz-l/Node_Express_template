import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty
} from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class DeleteGameRequest extends APIRequest {
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
