'use strict';

export type OperationOutcomeIssueSeverity = 'information' | 'error' | 'fatal' | 'warning';
export type OperationOutcomeIssueCode = 'informational' | 'exception' | 'invalid';
export type OperationOutComeResourceType = 'OperationOutcome';
export type PortNumber = number | string;
export type StatusCode = 500 | 400 | 202 | 404;
export type ResourceType = 'Communication' | 'CommunicationRequest';

export interface UrlArgs {
  host: string;
  port: PortNumber;
  secured: boolean;
  path: string;
}

export interface OperationOutcomeIssue {
  severity: OperationOutcomeIssueSeverity;
  code: OperationOutcomeIssueCode;
  details: {
    text: string;
  };
}

export interface OperationOutcome {
  resourceType: OperationOutComeResourceType;
  issues: OperationOutcomeIssue[];
}

export interface SeverityAndCode {
  severity: OperationOutcomeIssueSeverity;
  code: OperationOutcomeIssueCode;
}

interface Reference {
  reference: string;
}

interface Identifier {
  system: string;
  value: string;
}

/**
 * FHIR Communication Resource.
 */
export interface CommunicationResource {
  identifier: Identifier[];
  resourceType: 'Communication';
  status: 'in-progress' | 'completed' | 'entered-in-error';
  basedOn: Reference;
  sent?: Date;
}
