import { container } from '../../config/inversify-config';
import { USER_ID } from '../../domain/constants/http-headers';
import { Request, Response, NextFunction } from 'express';
import ProviderService from '../../domain/services/game';

const gameOperationAuthorize = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const providerId = req.get(USER_ID);
    const { gameId } = req.params;

    const providerService = container.get(ProviderService);

    await providerService.authorize(gameId, providerId!);
    next();
  } catch (error) {
    next(error);
  }
};

export default gameOperationAuthorize;
