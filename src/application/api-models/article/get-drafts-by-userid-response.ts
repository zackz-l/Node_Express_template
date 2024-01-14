import Post from '../../../domain/aggregates/articles/article';

class PostResponse {
  constructor(
    public title: string,
    public content: string,
    public userid: string,
    public id: string
  ) {}
}

export default class GetDraftsByUseridResponse {
  constructor(public posts: Array<PostResponse>) {}

  static fromPosts(posts: Array<Post>) {
    return new GetDraftsByUseridResponse(
      posts.map(
        (post) =>
          new PostResponse(post.title, post.content, post.userId!, post.id!)
      )
    );
  }
}
