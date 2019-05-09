'use strict';
import axios from 'axios';
import { default as config } from 'nconf';
import { buildHearthUrl, getResourceIdFromLocationHeader } from '../utils';
import  { PortNumber } from '../utils/types';
import { fhirResources, EnvKeys } from '../constants';

const addCommunicationRequest = async (resource: Object) => {
  const hearthBaseUrl = buildHearthUrl({
    host: config.get(EnvKeys.HearthHost) as string,
    port: config.get(EnvKeys.HearthPort) as PortNumber,
    secured: config.get(EnvKeys.HearthSecured) as boolean,
    path: `fhir/${fhirResources.COMMUNICATION_REQUEST}`
  });

  const response = await axios.post(hearthBaseUrl, resource);
  return {
    communicationRequestReference: getResourceIdFromLocationHeader(response.headers.location)
  };
};

const addCommunicationResource = (resource: Object) =>
  new Promise((resolve, reject) => resolve(resource));

export default {
  addCommunicationRequest,
  addCommunicationResource
};
