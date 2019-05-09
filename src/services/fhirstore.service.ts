'use strict';
import axios from 'axios';
import { default as config } from 'nconf';
import { buildHearthUrl, getResourceIdFromLocationHeader } from '../utils';
import  { PortNumber } from '../utils/types';
import { fhirResources, EnvKeys } from '../constants';

const addCommunicationRequest = async (resource: Object): Promise<any> =>
  new Promise((resolve, reject) => {
    axios.post(
      buildHearthUrl({
        host: config.get(EnvKeys.HearthHost) as string,
        port: config.get(EnvKeys.HearthPort) as PortNumber,
        secured: config.get(EnvKeys.HearthSecured) as boolean,
        path: `fhir/${fhirResources.COMMUNICATION_REQUEST}`
      }),
      resource)
      .then(response => resolve({
        communicationRequestReference: getResourceIdFromLocationHeader(response.headers.location)
      }))
      .catch(err => reject(err.message));
  });

const addCommunicationResource = (resource: Object) =>
  new Promise((resolve, reject) => resolve(resource));

export default {
  addCommunicationRequest,
  addCommunicationResource
};
