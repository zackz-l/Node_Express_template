import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import VideoPost from '../../../domain/aggregates/video/video';
import { USER_ID } from '../../../domain/constants/http-headers';

export default class CreateVideoPostRequest extends APIRequest {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(200, { message: 'The title is too long. The maximum length is 200 characters' })
  title: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'The description is too long. The maximum length is 1000 characters' })
  description: string;

  constructor(request: Request) {
    super();
    const { title, description } = request.body;
    this.userId = request.get(USER_ID)!;
    this.title = title;
    this.description = description;
  }

  toPost() {
    return new VideoPost(this.title, this.description, this.userId);
  }
}
