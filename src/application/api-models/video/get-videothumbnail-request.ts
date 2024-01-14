import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class GetVideoThumbnailRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  videoPostId: string;

  constructor(request: Request) {
    super();
    const { videoPostId } = request.params;
    this.videoPostId = videoPostId;
  }
}
