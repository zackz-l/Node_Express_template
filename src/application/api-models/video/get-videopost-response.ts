import { PostStatus } from '@prisma/client';
import VideoPost from '../../../domain/aggregates/video/video';

export default class GetVideoPostResponse {
  constructor(
    public title: string,
    public description: string,
    public readonly userId?: string,
    public readonly id?: string,
    public status?: PostStatus
  ) {}

  static fromPost(Post: VideoPost) {
    return new GetVideoPostResponse(
      Post.title,
      Post.description,
      Post.userId,
      Post.id,
      Post.status
    );
  }
}
