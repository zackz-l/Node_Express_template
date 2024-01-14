import {
  IsArray,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString
} from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { GameCategory } from '@prisma/client';

export default class UpdateGameCategoryRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  gameId: string;

  @IsArray()
  @IsDefined()
  @IsNotEmpty()
  gameCategory: GameCategory[];

  constructor(request: Request) {
    super();
    const { gameId } = request.params;
    const { gameCategory } = request.body;
    this.gameCategory = gameCategory;
    this.gameId = gameId;
  }
}
