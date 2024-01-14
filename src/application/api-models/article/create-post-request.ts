import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import Post from '../../../domain/aggregates/articles/article';
import { USER_ID } from '../../../domain/constants/http-headers';

export default class CreatePostRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  content: string;

  constructor(request: Request) {
    super();
    const { title, content } = request.body;
    this.userId = request.get(USER_ID)!;
    this.title = title;
    this.content = content;
  }

  toPost() {
    return new Post(this.title, this.content, this.userId);
  }
}
