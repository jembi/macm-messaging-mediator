'use strict';

export type OperationOutcomeIssueSeverity = 'information' | 'error' | 'fatal' | 'warning';
export type OperationOutcomeIssueCode = 'informational' | 'exception';
export type OperationOutComeResourceType = 'OperationOutcome';
export type PortNumber = number | string;

export interface UrlArgs {
  host: string;
  port: PortNumber;
  secured: boolean;
  path: string;
}

export interface OperationOutcomeIssue {
  severity: OperationOutcomeIssueSeverity;
  code: OperationOutcomeIssueCode;
  text: string;
}

export interface OperationOutcome {
  resourceType: OperationOutComeResourceType;
  issues: OperationOutcomeIssue[];
}
