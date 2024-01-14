import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import crypto from 'crypto';

export default class UploadPostImageRequest extends APIRequest {
  @IsDefined()
  @IsNotEmpty()
  image: Express.Multer.File;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  postId: string;

  @IsDefined()
  imageBuffer: Buffer;

  constructor(request: Request) {
    super();
    const { postId } = request.params;
    this.image = request.file!;
    this.postId = postId;
    this.imageBuffer = this.image.buffer;
  }

  toPostPath() {
    const format = this.image.mimetype.split('/')[1];
    return (
      'image/' +
      this.postId +
      crypto.randomUUID().substring(0, 8) +
      '.' +
      format
    );
  }
}
