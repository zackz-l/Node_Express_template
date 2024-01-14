import { ENCODE } from '../../domain/constants/encode';
import { injectable } from 'inversify';
import { IFileStorage } from '../../domain/contracts/file-storage';
import AWS from 'aws-sdk';
import logger from '../log/logger';
import { S3_BUCKET_NAME } from '../../config/env-config';
import MediaConvert from '../media-converter/media-converter';
import { stringify } from 'querystring';

@injectable()
export default class FileStorage implements IFileStorage {
  private s3: AWS.S3;
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECERT_KEY
    });
  }

  public async uploadGameIcon(key: string, gameIcon: Buffer): Promise<void> {
    const params = {
      Bucket: S3_BUCKET_NAME!,
      Key: key,
      Body: gameIcon,
      ContentEncoding: ENCODE
    };
    await this.s3.putObject(params).promise();
  }

  public async uploadVideo(
    key: string,
    videoInfor: Buffer,
    videoId: string
  ): Promise<string> {
    const params = {
      Bucket: S3_BUCKET_NAME!,
      Key: key,
      Body: videoInfor
    };
    await this.s3.putObject(params).promise();
    return await MediaConvert.sliceVideo(key, videoId);
  }

  public async findgameIconFromBucket(gamePath: string): Promise<string> {
    const params = { Bucket: S3_BUCKET_NAME, Key: gamePath };

    logger.info(gamePath);
    const url = await this.s3.getSignedUrlPromise('getObject', params);
    return url;
  }

  public async uploadPostImage(key: string, postImage: Buffer): Promise<void> {
    const params = {
      Bucket: S3_BUCKET_NAME!,
      Key: key,
      Body: postImage,
      ContentEncoding: ENCODE
    };
    await this.s3.putObject(params).promise();
  }

  public async uploadvr(key: string): Promise<string> {
    const params = {
      Bucket: S3_BUCKET_NAME!,
      Key: key,
      ContentType: 'video/mp4',
      ACL: 'public-read',
      Expires: 3600 // Expiration time in seconds
    };
    return this.s3.getSignedUrl('putObject', params);
  }

  public async removeImageFromS3(key: string): Promise<void> {
    const params = {
      Bucket: S3_BUCKET_NAME!,
      Key: key,
      ACL: 'public-read',
      Expires: 3600 // Expiration time in seconds
    };
    await this.s3.deleteObject(params).promise();
  }
}
