'use strict';

export const fhirTelecomSystems = {
  PHONE: 'phone'
};

export const statuses = {
  ACTIVE: 'active'
};

export const fhirResources = {
  COMMUNICATION_REQUEST: 'CommunicationRequest',
  PRACTITIONER: 'Practitioner',
  ORGANIZATION: 'Organization'
};

export const fhirPriorities = {
  ROUTINE: 'routine'
};

export enum EnvKeys {
  HearthHost = 'HEARTH_HOST',
  HearthPort = 'HEARTH_PORT',
  HearthSecured = 'HEARTH_SCURED',
  NodeEnv = 'NODE_ENV',
  Port = 'PORT'
}
