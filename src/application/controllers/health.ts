import { Request, Response } from 'express';
import HttpStatusCode from 'http-status-codes';
import { controller, httpGet } from 'inversify-express-utils';
import AWS, { AWSError } from 'aws-sdk';
import { SendEmailRequest, SendEmailResponse } from 'aws-sdk/clients/ses';

AWS.config.update({ region: 'us-east-1' });

@controller('/health')
export default class HealthController {
  @httpGet('/')
  public async health(_request: Request, response: Response): Promise<void> {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });

    const params: SendEmailRequest = {
      Source: 'notification@wakuwaku.me',
      Destination: {
        ToAddresses: ['chalet056@gmail.com']
      },
      Message: {
        Subject: {
          Data: 'subject',
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: 'body',
            Charset: 'UTF-8'
          }
        }
      }
    };

    // ses.sendEmail(params, (err: AWSError, data: SendEmailResponse) => {
    //   if (err) console.log(err, err.stack);
    //   else console.log(data);
    // });

    response.sendStatus(HttpStatusCode.OK);
  }
}
