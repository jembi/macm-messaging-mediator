'use strict';

type CommunicationResourceValue = 'CommunicationRequest';
type ReferenceResource = 'Practitioner' | 'Organization';
type Priority = 'routine';

export interface AddCommunicationRequestResponse {
  communicationRequestReference: string;
  text: string;
  contactNumbers: string[];
}

interface Reference {
  reference: string;
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
  resourceType: ReferenceResource;
  id: string;
  name: string;
  telecom?: Telecom;
}

/**
 * FHIR CommunicaitonRequest resource
 */
export interface CommunicationRequest {
  resourceType: CommunicationResourceValue;
  status: string;
  payload: Payload;
  contained: ContainedResource[];
  priority: Priority;
  category: Category[];
  authoredOn: Date;
  requester: Reference;
  recipient: Reference[];
}
