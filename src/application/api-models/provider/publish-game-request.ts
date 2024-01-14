import { IsDefined, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import Game from '../../../domain/aggregates/game-provider/game';
import { USER_ID } from '../../../domain/constants/http-headers';
import { GameCategory } from '@prisma/client';

export default class PublishGameRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  providerId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsDefined()
  @IsNotEmpty()
  gameCategory: GameCategory[];

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  introduction: string;

  constructor(request: Request) {
    super();
    const { name, introduction, gameCategory } = request.body;
    this.name = name;
    this.introduction = introduction;
    this.gameCategory = gameCategory;
    this.providerId = request.get(USER_ID)!;
  }

  toGame() {
    return new Game(
      this.providerId,
      this.name,
      this.introduction,
      this.gameCategory
    );
  }
}
