import { container } from '../../config/inversify-config';
import { SESSION_ID, USER_ID } from '../../domain/constants/http-headers';
import { Request, Response, NextFunction } from 'express';
import AuthService from '../../domain/services/auth';
import { AuthenticationError, ERROR_CODE } from '../../errors';

const authenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.get(SESSION_ID);
    const userId = req.get(USER_ID);

    const authService = container.get(AuthService);

    if (!sessionId || !userId) {
      const userId = req.get(USER_ID);
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `User with userId: ${userId} with sessionId: ${sessionId} is not authenticated.`
      );
    }

    await authService.authenticateUser(userId, sessionId);
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
