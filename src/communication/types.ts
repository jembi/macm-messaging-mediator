'use strict';

export type Status = 'in-progress' | 'completed' | 'entered-in-error';
type ResourceType = 'Communication';

interface Reference {
  reference: string;
}

/**
 * FHIR Communication Resource.
 */
export interface CommunicationResource {
  resourceType: ResourceType;
  status: Status;
  basedOn: Reference;
  sent: Date;
}
