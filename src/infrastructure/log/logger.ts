import { createLogger, format, transports } from 'winston';
import { DATADOG_KEY } from '../../config/env-config';

const httpTransportOptions = {
  host: 'http-intake.logs.datadoghq.com',
  path: `/api/v2/logs?dd-api-key=${DATADOG_KEY}&ddsource=nodejs&service=dev`,
  ssl: true
};

const logger = createLogger({
  exitOnError: false,
  format: format.json(),
  transports: [
    new transports.Http(httpTransportOptions),
    new transports.Console({ format: format.simple() })
  ]
});

export default logger;
