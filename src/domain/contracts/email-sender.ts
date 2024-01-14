export interface IEmailSender {
  sendUserVerificationEmail(userEmail: string, token: string): Promise<void>;
  sendProviderPasscodeEmail(
    providerEmail: string,
    passcode: string
  ): Promise<void>;
}
