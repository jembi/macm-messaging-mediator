'use strict';
import { createLogger, format, transports } from 'winston';
import { PortNumber, OperationOutcomeIssue, OperationOutcome, UrlArgs } from './types';

const formatLog = format.printf(info =>
  info.message
    .trim()
    .split('\n')
    .map(line => `${info.timestamp} ${info.level}: ${line}`)
    .join('\n'));

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    formatLog
  ),
  transports: [new transports.Console()]
});

export const wrapHandler = (fn: Function) =>
  (req: any, res: any, next: any) => fn(req, res, next).catch(next);

export const buildHearthUrl = ({ host, port, secured, path }: UrlArgs) => {
  const protocol = secured ? 'https' : 'http';
  const fullPath = (path && path.startsWith('/')) ? path.slice(1) : path;

  return `${protocol}://${host}:${port}/${fullPath}`;
};

export const createOperationOutcome =
  (operationOutcomeIssues: OperationOutcomeIssue[]) : OperationOutcome => {
    return {
      resourceType: 'OperationOutcome',
      issues: operationOutcomeIssues
    };
  };

export const getResourceIdFromLocationHeader = (location: string) =>
  location
    .trim()
    .split('/')
    .filter((item: string) => item !== '')[2];
