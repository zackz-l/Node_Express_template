import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty
} from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class UploadGameIconRequest extends APIRequest {
  @IsDefined()
  @IsNotEmpty()
  gameIconImage: Express.Multer.File;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  gameId: string;

  @IsDefined()
  @IsNotEmpty()
  imageBuffer: Buffer;

  constructor(request: Request) {
    super();
    const { gameId } = request.params;
    this.gameIconImage = request.file!;
    this.gameId = gameId;
    this.imageBuffer = this.gameIconImage.buffer;
  }

  toGameIconPath() {
    const format = this.gameIconImage.mimetype.split('/')[1];
    return 'image/' + this.gameId + '.' + format;
  }
}