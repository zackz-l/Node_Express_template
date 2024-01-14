import { container } from '../../config/inversify-config';
import { USER_ID } from '../../domain/constants/http-headers';
import { Request, Response, NextFunction } from 'express';
import PostService from '../../domain/services/article';

const editCommentAuthorize = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.get(USER_ID);
    const { commentId } = req.params;

    const postService = container.get(PostService);

    await postService.authorizeEditComment(commentId!, userId!);
    next();
  } catch (error) {
    next(error);
  }
};

export default editCommentAuthorize;
