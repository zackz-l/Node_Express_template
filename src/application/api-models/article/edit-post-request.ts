import { IsArray, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';
import Post from '../../../domain/aggregates/articles/article';

export default class EditPostRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  postId: string;

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

  @IsArray()
  @IsDefined()
  gameName: string[];

  constructor(request: Request) {
    super();
    const { title, content, gameName } = request.body;
    const { postId } = request.params;
    this.userId = request.get(USER_ID)!;
    this.title = title;
    this.content = content;
    this.postId = postId;
    this.gameName = gameName ?? [];
  }

  toPost() {
    return new Post(
      this.title,
      this.content,
      this.userId,
      this.postId,
      this.gameName
    );
  }
}
