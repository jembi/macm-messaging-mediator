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

interface Telecom {
  use: string;
  system: string;
  value: string;
}

interface Payload {
  contentString: string;
  contentAttachment: {
    title: string;
    'content-type': string;
    language: string;
  };
}

interface Category {
  coding: {
    system: string;
    code: string;
    display: string;
  };
  text: string;
}

interface ContainedResource {
  resourceType: 'Practitioner' | 'Organization';
  id: string;
  name: string;
  telecom?: Telecom;
}

interface Extension {
  url: string;
  valueString: string;
}

/**
 * FHIR CommunicaitonRequest resource
 */
export interface CommunicationRequest {
  id?: string;
  resourceType: 'CommunicationRequest';
  status: string;
  payload: Payload;
  contained: ContainedResource[];
  priority: 'routine';
  category: Category[];
  authoredOn: Date;
  requester: Reference;
  recipient: Reference[];
  extension?: Extension[];
}

export interface AddCommunicationRequestResponse {
  communicationRequestReference: string;
  text: string;
  contactNumbers: string[];
}

export interface OpeHimConfig {
  username: string;
  password: string;
  apiURL: string;
  trustSelfSigned: boolean;
  urn?: string;
}
