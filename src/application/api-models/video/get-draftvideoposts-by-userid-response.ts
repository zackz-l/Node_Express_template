import VideoPost from '../../../domain/aggregates/video/video';
class VideoPostResponse {
  constructor(
    public title: string,
    public description: string,
    public userid: string,
    public id: string
  ) {}
}

export default class GetDraftVideopostsByUseridResponse {
  constructor(public posts: Array<VideoPostResponse>) {}

  static fromVideoPosts(videoPosts: Array<VideoPost>) {
    return new GetDraftVideopostsByUseridResponse(
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
