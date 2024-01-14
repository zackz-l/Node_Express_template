import Comment from '../../../domain/aggregates/comments/comment';

class SubCommentsResponse {
  constructor(
    public subCommentId: string,
    public userId: string,
    public content: string
  ) {}
}

class PostCommentsResponse {
  constructor(
    public commentId: string,
    public userId: string,
    public content: string,
    public subComments: SubCommentsResponse[]
  ) {}
}

export default class QueryCommentsByPostResponse {
  constructor(public comments: PostCommentsResponse[]) {}

  static fromComments(comments: Comment[]) {
    return new QueryCommentsByPostResponse(
      comments.map(
        (comment) =>
          new PostCommentsResponse(
            comment.id!,
            comment.userId,
            comment.content,
            comment.subComments!.map(
              (subComment) =>
                new SubCommentsResponse(
                  subComment.id!,
                  subComment.userId,
                  subComment.content
                )
            )
          )
      )
    );
  }
}
