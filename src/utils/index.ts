'use strict';
import { createLogger, format, transports } from 'winston';
import {
  OperationOutcomeIssue,
  OperationOutcome,
  UrlArgs,
  SeverityAndCode,
  StatusCode } from './types';

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

/**
 * Creates an object to be used for creating an OperationOutcome FHIR resource. This function builds the object based on
 * the supplied HTTP status code.
 *
 * @throws {Error} When the HTTP status code is unkown.
 * @param statusCode {StatusCode} - Supported HTTP status codes.
 * @returns {SeverityAndCode}
 */
export const getSeverityAndCode = (statusCode: StatusCode): SeverityAndCode => {
  if (!(statusCode as StatusCode)) {
    throw new Error('The provided status code is not supported');
  }

  switch (statusCode) {
    case 500:
      return { severity: 'fatal', code: 'exception' };
    case 400:
    case 404:
      return { severity: 'error', code: 'invalid' };
    default:
      return { severity: 'information', code: 'informational' };
  }
};
