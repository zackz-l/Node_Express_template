import { IEmailSender } from '../../domain/contracts/email-sender';
import AWS, { AWSError } from 'aws-sdk';
import { injectable } from 'inversify';
import { SendEmailRequest, SendEmailResponse } from 'aws-sdk/clients/ses';
import { ENVIRONMENT, HOST } from '../../config/env-config';
import { sourceEmail } from '../../domain/constants/source-email';
import { env } from '../../domain/constants/env-enum';
AWS.config.update({ region: 'us-east-1' });

@injectable()
export default class EmailSender implements IEmailSender {
  public async sendUserVerificationEmail(
    userEmail: string,
    token: string
  ): Promise<void> {
    if (ENVIRONMENT == env.LOCAL) {
      return;
    }
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });

    const params: SendEmailRequest = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: [userEmail]
      },
      Message: {
        Subject: {
          Data: 'Email Verification',
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: `${HOST}/auth/verify-email?token=${token}`,
            Charset: 'UTF-8'
          }
        }
      }
    };

    ses.sendEmail(params, (err: AWSError, data: SendEmailResponse) => {
      if (err) throw new Error(err.message);
    });
  }

  public async sendProviderPasscodeEmail(
    providerEmail: string,
    passcode: string
  ): Promise<void> {
    if (ENVIRONMENT == env.LOCAL) {
      return;
    }
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });

    const params: SendEmailRequest = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: [providerEmail]
      },
      Message: {
        Subject: {
          Data: 'One Time Passcode',
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: ` ${passcode}`,
            Charset: 'UTF-8'
          }
        }
      }
    };

    ses.sendEmail(params, (err: AWSError, data: SendEmailResponse) => {
      if (err) throw new Error(err.message);
    });
  }
}
