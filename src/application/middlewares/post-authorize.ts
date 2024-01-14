import { container } from '../../config/inversify-config';
import { USER_ID } from '../../domain/constants/http-headers';
import { Request, Response, NextFunction } from 'express';
import PostService from '../../domain/services/article';

const authorize = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.get(USER_ID);
    const { postId } = req.params;

    const postService = container.get(PostService);

    await postService.authorize(postId, userId!);
    next();
  } catch (error) {
    next(error);
  }
};

export default authorize;
