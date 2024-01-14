import { PostStatus } from '@prisma/client';

export default class VideoPost {
  constructor(
    public title: string,
    public description: string,
    public readonly userId?: string,
    public readonly id?: string,
    public status?: PostStatus,
    public gameMentions?: string[]
  ) {}
}
