import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class RemoveImageFromArticleRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  articleId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  imagePath: string;

  constructor(request: Request) {
    super();
    const { articleId, cimagePath } = request.params;
    this.articleId = articleId;
    this.imagePath = cimagePath;
  }
}
