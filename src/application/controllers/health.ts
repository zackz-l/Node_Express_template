import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { controller, httpGet } from "inversify-express-utils";

@controller("/health")
export default class HealthController {
  @httpGet("/")
  public async health(_request: Request, response: Response): Promise<void> {
    response.sendStatus(HttpStatusCode.OK);
  }
}
