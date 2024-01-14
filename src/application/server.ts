import express from 'express';
import corsFilter from 'cors';
import { InversifyExpressServer } from 'inversify-express-utils';
import './controllers';
import { container } from '../config/inversify-config';
import error from './middlewares/error';
import logger from '../infrastructure/log/logger';
import bodyParser from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import options from "./swagger.json"

const specs = swaggerJsdoc(options);

export const startServer = async () => {
  let server = new InversifyExpressServer(container);

  server.setConfig((app) => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({ limit: '5mb' }));
    app.use(corsFilter());
    app.options('*', corsFilter());
  });

  server.setErrorConfig((app) => {
    app.use(error);
  });

  let app = server.build();
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
  );
  app.listen(8000, () => logger.info(`server listening on port 8000`));

  return server;
};
