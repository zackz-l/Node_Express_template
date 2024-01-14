import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class UploadVideoRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  @IsDefined()
  video: Express.Multer.File;

  @IsDefined()
  @IsNotEmpty()
  videoBuffer: Buffer;

  constructor(request: Request) {
    super();
    const { gameId } = request.params;

    const video = request.file!;
    this.video = video;
    this.gameId = gameId;
    this.videoBuffer = this.video.buffer;
  }

  toVideoPath() {
    const format = this.video.mimetype.split('/')[1];
    return 'image/' + this.gameId + '.' + format;
  }
}
