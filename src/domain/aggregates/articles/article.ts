import { PostStatus } from '@prisma/client';

export default class Post {
  constructor(
    public title: string,
    public content: string,
    public readonly userId?: string,
    public readonly id?: string,
    public gameName?: string[],
    public imagePath?: string[],
    public status?: PostStatus
  ) {}
}
