export interface IFileStorage {
  findgameIconFromBucket(gamePath: string): Promise<string>;
  uploadGameIcon(key: string, gameIcon: Buffer): Promise<void>;
  uploadVideo(key: string, videoInfor: Buffer, gameId: string): Promise<string>;
  uploadPostImage(key: string, postImage: Buffer): Promise<void>;
  uploadvr(key: string): Promise<string>;
  removeImageFromS3(key: string): Promise<void>
  ;
}
