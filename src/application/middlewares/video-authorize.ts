import { container } from '../../config/inversify-config';
import { USER_ID } from '../../domain/constants/http-headers';
import { Request, Response, NextFunction } from 'express';
import VideoService from '../../domain/services/video';

const videoAuthorize = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.get(USER_ID);
    const { postId } = req.params;

    const videoService = container.get(VideoService);

    await videoService.authorize(postId, userId!);
    next();
  } catch (error) {
    next(error);
  }
};

export default videoAuthorize;
