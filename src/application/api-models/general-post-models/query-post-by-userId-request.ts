import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class QueryPostByUserIdRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string | undefined;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  pageIndex: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  pageLimit: number;

  constructor(request: Request) {
    super();
    const { userId } = request.params;
    this.userId = userId;
    this.title = (request.query.searchWord as string) || undefined;
    this.pageIndex = parseInt(request.query.page as string) || 0;
    this.pageLimit = parseInt(request.query.pageLimit as string) || 10;
  }
}
