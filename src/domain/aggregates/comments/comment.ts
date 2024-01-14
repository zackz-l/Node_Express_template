import SubComment from './sub-comment';

export default class Comment {
  constructor(
    public readonly userId: string,
    public content: string,
    public readonly postId?: string,
    public readonly id?: string,
    public subComments?: SubComment[],
    public deleteAT?: Date | null
  ) {}
}
