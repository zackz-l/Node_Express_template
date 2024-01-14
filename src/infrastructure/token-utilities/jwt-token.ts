import { ITokenUtilities } from '../../domain/contracts/token-utilities';
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET,
  EMAIL_VERIFICATION_TOKEN_EXPIRATION
} from '../../config/env-config';
import logger from '../log/logger';

@injectable()
export default class TokenUtilities implements ITokenUtilities {
  public async generateEmailVerificationToken(userId: string): Promise<string> {
    return jwt.sign({ userId: userId }, ACCESS_TOKEN_SECRET!, {
      expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRATION
    });
  }

  public verifyEmailVerificationToken(token: string): Promise<string> {
    const decodedToken = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET!,
      function (err, decoded) {
        if (err) {
          throw new Error(err.message);
        }
        return (decoded as jwt.JwtPayload).userId;
      }
    );

    return decodedToken!;
  }
}
