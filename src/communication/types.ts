'use strict';

export type Status = 'in-progress' | 'completed' | 'entered-in-error';
type ResourceType = 'Communication';

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
  resourceType: ResourceType;
  status: Status;
  basedOn: Reference;
  sent: Date;
}
