import VideoPost from '../../../domain/aggregates/video/video';

class VideoPostResponse {
  constructor(
    public title: string,
    public description: string,
    public userid: string,
    public id: string
  ) {}
}

export default class QueryVideoPostsResponse {
  constructor(public videoPosts: Array<VideoPostResponse>) {}

  static fromPosts(videoPosts: Array<VideoPost>) {
    return new QueryVideoPostsResponse(
      videoPosts.map(
        (videoPost) =>
          new VideoPostResponse(
            videoPost.title,
            videoPost.description,
            videoPost.userId!,
            videoPost.id!
          )
      )
    );
  }
}
