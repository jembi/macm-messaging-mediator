'use strict';
import axios from 'axios';
import config from '../config';
import { buildHearthUrl, getResourceIdFromLocationHeader, PortNumber } from '../utils';
import { fhirResources, configOptions } from '../constants';

const addCommunicationRequest = async (resource: Object) => {
  const hearthBaseUrl = buildHearthUrl({
    host: config.get(configOptions.HEARTH_HOST) as string,
    port: config.get(configOptions.HEARTH_PORT) as PortNumber,
    secured: config.get(configOptions.HEARTH_SCURED) as boolean,
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
