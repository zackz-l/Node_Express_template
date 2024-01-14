import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { APIRequest } from '../api-request';
import { Request } from 'express';
import { USER_ID } from '../../../domain/constants/http-headers';
import VideoPost from '../../../domain/aggregates/video/video';

export default class EditVideoPostRequest extends APIRequest {
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
    const { postId } = request.params;
    this.userId = request.get(USER_ID)!;
    this.title = title;
    this.description = description;
    this.postId = postId;
  }

  toPost() {
    return new VideoPost(
      this.title,
      this.description,
      this.userId,
      this.postId
    );
  }
}
