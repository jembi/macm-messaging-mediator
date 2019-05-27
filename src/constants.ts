'use strict';

export const fhirTelecomSystems = {
  PHONE: 'phone'
};

export const statuses = {
  ACTIVE: 'active'
};

export const fhirResources = {
  COMMUNICATION_REQUEST: 'CommunicationRequest',
  COMMUNICATION: 'Communication',
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
  Port = 'PORT',
  RapidProSmsFlowId = 'RAPIDPRO_SMS_FLOW_ID',
  RapidProApiKey = 'RAPIDPRO_API_KEY',
  RapidProApiUrl = 'RAPIDPRO_API_URL'
}
