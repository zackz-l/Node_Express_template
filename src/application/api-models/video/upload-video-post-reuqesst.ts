import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class UploadVideoPostRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  videoId: string;

  @IsNotEmpty()
  @IsDefined()
  video: Express.Multer.File;

  @IsDefined()
  @IsNotEmpty()
  videoBuffer: Buffer;

  constructor(request: Request) {
    super();
    const { videoId } = request.params;

    const video = request.file!;
    this.video = video;
    this.videoId = videoId;
    this.videoBuffer = this.video.buffer;
  }

  toVideoPath() {
    const format = this.video.mimetype.split('/')[1];
    return 'video/' + this.videoId + '.' + format;
  }
}
