import { IsDefined, IsNotEmpty, IsJSON, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import GameInforamtionfile from '../../../domain/aggregates/game-provider/game-information-json-file';

export default class UploadJsonfileRequest extends APIRequest {
  @IsNotEmpty()
  @IsDefined()
  chainMataData: object;

  @IsNotEmpty()
  @IsJSON()
  externalLink: JSON;

  @IsNotEmpty()
  @IsJSON()
  chainModifiedGame: JSON;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  gameId: string;

  constructor(request: Request) {
    super();
    const { chainMataData, externalLink, chainModifiedGame } = request.body;

    const { gameId } = request.params;

    this.chainMataData = chainMataData;
    this.externalLink = externalLink;
    this.chainModifiedGame = chainModifiedGame;
    this.gameId = gameId;
  }

  tofile() {
    return new GameInforamtionfile(
      this.gameId,
      this.chainMataData,
      this.externalLink,
      this.chainModifiedGame
    );
  }
}
