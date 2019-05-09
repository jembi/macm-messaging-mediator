'use strict';
import { createLogger, format, transports } from 'winston';

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

export interface UrlArgs {
  host: string;
  port: PortNumber;
  secured: boolean;
  path: string;
}

export const buildHearthUrl = ({ host, port, secured, path }: UrlArgs) => {
  const protocol = secured ? 'https' : 'http';
  const fullPath = (path && path.startsWith('/')) ? path.slice(1) : path;

  return `${protocol}://${host}:${port}/${fullPath}`;
};

type OperationOutcomeIssueSeverity = 'information' | 'error' | 'fatal' | 'warning';
type OperationOutcomeIssueCode = 'informational' | 'exception';
type OperationOutComeResourceType = 'OperationOutcome';

export interface OperationOutcomeIssue {
  severity: OperationOutcomeIssueSeverity;
  code: OperationOutcomeIssueCode;
  text: string;
}

export interface OperationOutcome {
  resourceType: OperationOutComeResourceType;
  issues: OperationOutcomeIssue[];
}

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

export type PortNumber = number | string;
