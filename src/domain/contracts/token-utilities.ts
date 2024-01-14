export interface ITokenUtilities {
  generateEmailVerificationToken(userId: string): Promise<string>;
  verifyEmailVerificationToken(token: string): Promise<string>;
}
