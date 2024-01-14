import { PostStatus } from '@prisma/client';
import Post from '../../../domain/aggregates/articles/article';

export default class GetPostResponse {
  constructor(
    public title: string,
    public content: string,
    public readonly userId?: string,
    public readonly id?: string,
    public status?: PostStatus
  ) {}

  static fromPost(Post: Post) {
    return new GetPostResponse(
      Post.title,
      Post.content,
      Post.userId,
      Post.id,
      Post.status
    );
  }
}
