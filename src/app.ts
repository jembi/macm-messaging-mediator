'use strict';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { default as createError } from 'http-errors';
import { default as communicationRequest } from './communication_request';
import { default as config } from 'nconf';
import { EnvKeys } from './constants';

const app = express();

export const resourceNotFoundHandler = (req: Request, res: Response, next: Function) =>
  next(createError(404));

export const errorHandler = (err: any, req: Request, res: Response, next: Function) => {
  res.locals.message = err.message;
  res.locals.error = config.get(EnvKeys.NodeEnv) === 'development' ? err : {};

  res.status(err.status || 500);
  res.json(res.locals.error);
};

app.use(helmet())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use('/CommunicationRequest', communicationRequest.apiRouter)
  .use(resourceNotFoundHandler)
  .use(errorHandler);

export default app;