export default class ArticlesAndVideos {
  constructor(
    public title: string,
    public readonly userId: string,
    public readonly id: string,
    public readonly gameMentions: string[],
    public readonly createdDate: Date,
    public readonly type: string,
    public description?: string,
    public content?: string,
    public videoUrl?: Array<string>,
    public videoThumbnail?: string
  ) {}
}
