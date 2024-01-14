export default class SubComment {
  constructor(
    public readonly userId: string,
    public readonly parentCommentId: string,
    public content: string,
    public readonly id?: string
  ) {}
}
