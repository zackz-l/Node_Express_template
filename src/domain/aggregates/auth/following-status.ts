export default class FollowingStatus {
  constructor(
    public userId: string,
    public followingId: string[],
    public followerId: string[]
  ) {}
}
