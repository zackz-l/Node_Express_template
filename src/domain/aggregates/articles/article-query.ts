import { PostStatus } from '@prisma/client';

export type PostQuery = {
  id?: string;
  userId?: string;
  title?: string;
  content?: string;
  status?: PostStatus;
  pageIndex?: number;
  pageLimit?: number;
  gameMention?: string;
  gameMentions?: string[];
};
