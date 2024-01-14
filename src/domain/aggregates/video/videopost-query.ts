import { PostStatus } from '@prisma/client';

export type VideoPostQuery = {
  id?: string;
  userId?: string;
  title?: string;
  description?: string;
  status?: PostStatus;
  pageIndex?: number;
  pageLimit?: number;
  gameMention?: string[];
};
