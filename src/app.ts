'use strict';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import config from './config';
import { default as createError } from 'http-errors';
import { default as communicationRequest } from './communication_request';
import { default as communication } from './communication';
import { createOperationOutcome, getSeverityAndCode, logger } from './utils';
import { OperationOutcomeIssue, SeverityAndCode, StatusCode } from './utils/types';
import { EnvKeys } from './constants';
import { apiRouter as channelsApiRouter } from './channels';

const app = express();

export const resourceNotFoundHandler = (req: Request, res: Response, next: Function) =>
  next(createError(404));

export const errorHandler = (err: any, req: Request, res: Response, next: Function) => {
  const statusCode : StatusCode = err.status || 500;
  const severityAndCode : SeverityAndCode = getSeverityAndCode(statusCode);
  const issueText : any = (statusCode === 500 && config.get(EnvKeys.NodeEnv) === 'production')
    ? 'Internal Server Error' : err.message || err;

  logger.error(err.message || err);

  const issue : OperationOutcomeIssue = {
    severity: severityAndCode.severity,
    code: severityAndCode.code,
    details: {
      text: issueText
    }
  };

  res.locals.error = createOperationOutcome([issue]);
  res.status(statusCode).json(res.locals.error);
};

app.use(helmet())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use('/CommunicationRequest', communicationRequest.apiRouter)
  .use('/Communication', communication.apiRouter)
  .use('/webhook', channelsApiRouter)
  .use(resourceNotFoundHandler)
  .use(errorHandler);

export default app;
