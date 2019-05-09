'use strict';
import axios from 'axios';
import { default as config } from 'nconf';
import { buildHearthUrl, getResourceIdFromLocationHeader } from '../utils';
import { PortNumber } from '../utils/types';
import { fhirResources, EnvKeys } from '../constants';
import { AddCommunicationRequestResponse } from '../communication_request/types';

const addCommunicationRequest = async (resource: Object): Promise<AddCommunicationRequestResponse> =>
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
        communicationRequestReference:
          `${fhirResources.COMMUNICATION_REQUEST}/${getResourceIdFromLocationHeader(response.headers.location)}`
      }))
      .catch(err => reject(err.message));
  });

const addCommunicationResource =
  (resource: AddCommunicationRequestResponse): Promise<AddCommunicationRequestResponse> =>
    new Promise((resolve, reject) => resolve(resource));

export default {
  addCommunicationRequest,
  addCommunicationResource
};
