import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsDefined
} from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';

export default class QueryGamesByNameRequest extends APIRequest {
  @IsString()
  @IsNotEmpty()
  name: string | undefined;

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
    this.name = (request.query.searchWord as string) || undefined;
    this.pageIndex = parseInt(request.query.page as string) || 0;
    this.pageLimit = parseInt(request.query.pageLimit as string) || 10;
  }
}
