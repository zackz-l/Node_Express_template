import { container } from '../../config/inversify-config';
import { SESSION_ID, USER_ID } from '../../domain/constants/http-headers';
import { Request, Response, NextFunction } from 'express';
import ProviderService from '../../domain/services/game';
import { AuthenticationError, ERROR_CODE } from '../../errors';

const providerAuthenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.get(SESSION_ID);
    const providerId = req.get(USER_ID);

    const providerService = container.get(ProviderService);

    if (!sessionId || !providerId) {
      const providerId = req.get(USER_ID);
      throw new AuthenticationError(
        ERROR_CODE.AUTHENTICATION_ERROR,
        `User with userId: ${USER_ID} with sessionId: ${sessionId} is not authenticated.`
      );
    }
    await providerService.authenticateProvider(providerId, sessionId);
    next();
  } catch (error) {
    next(error);
  }
};

export default providerAuthenticate;
