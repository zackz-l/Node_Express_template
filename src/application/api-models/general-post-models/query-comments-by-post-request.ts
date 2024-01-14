import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max
} from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class QueryCommentsByPostRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  postId: string;

  @IsInt()
  @IsDefined()
  @IsNotEmpty()
  @Min(1)
  pageIndex: number;

  @IsInt()
  @IsDefined()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  pageLimit: number;

  constructor(request: Request) {
    super();
    const { postId } = request.params;
    this.postId = postId;
    this.pageIndex = parseInt(request.query.page as string);
    this.pageLimit = parseInt(request.query.pageLimit as string);
  }
}
