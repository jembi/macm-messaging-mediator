'use strict';
import axios from 'axios';
import { default as config } from 'nconf';
import { buildHearthUrl, getResourceIdFromLocationHeader } from '../utils';
import { PortNumber } from '../utils/types';
import { fhirResources, EnvKeys } from '../constants';
import { AddCommunicationRequestResponse, CommunicationRequest } from '../communication_request/types';
import { CommunicationResource } from '../communication/types';

/**
 * Parses a CommunicationRequest resource and returns a collection of recipient contact numbers.
 *
 * @param {CommunicationRequest} resource - The resource containing recipient contact numbers.
 * @returns {Array} - A collection of contact numbers.
 */
export const getRecipientContactNumbers = (resource: CommunicationRequest) : string[] =>
  resource.contained
    .filter(containedResource =>
      containedResource.id === resource.recipient[0].reference.substring(1) &&
        containedResource.telecom &&
        containedResource.telecom.system === 'phone' &&
        containedResource.telecom.value
    )
    .map(containedResource => containedResource.telecom &&
      containedResource.telecom.value ? `tel:${containedResource.telecom.value}` : '');

/**
 * Parses a CommunicationRequest resource and returns a text message string.
 *
 * @param {CommunicationRequest} resource - The resource containing the text message.
 */
const getTextMessage = (resource: CommunicationRequest) => resource.payload.contentString;

/**
 * Create a response object for the addCommunicationRequest function
 *
 * @param {string} communicationRequestReference
 * @param {CommunicationRequest} resource -
 * @returns {AddCommunicationRequestResponse}
 */
const createAddCommunicationRequestResponse =
  (communicationRequestReference: string, resource: CommunicationRequest) : AddCommunicationRequestResponse => ({
    communicationRequestReference,
    contactNumbers: getRecipientContactNumbers(resource),
    text: getTextMessage(resource)
  });

/**
 * Add a new CommunicationRequest resource to the FHIR store.
 *
 * @param {CommunicationRequest} resource - CommunicationRequest resource to be sent to the FHIR store.
 * @returns {Promise<AddCommunicationRequestResponse>}
 */
const addCommunicationRequest = async (resource: CommunicationRequest): Promise<AddCommunicationRequestResponse> =>
  new Promise((resolve, reject) => {
    axios.post(
      buildHearthUrl({
        host: config.get(EnvKeys.HearthHost) as string,
        port: config.get(EnvKeys.HearthPort) as PortNumber,
        secured: config.get(EnvKeys.HearthSecured) as boolean,
        path: `fhir/${fhirResources.COMMUNICATION_REQUEST}`
      }),
      resource)
      .then(response => resolve(createAddCommunicationRequestResponse(
        `${fhirResources.COMMUNICATION_REQUEST}/${getResourceIdFromLocationHeader(response.headers.location)}`,
        resource
      )))
      .catch(err => reject(err.message));
  });

/**
 * Add a new Communication resource to the FHIR store.
 *
 * @param {CommunicationResource} resource - Communication resource to be sent to the FHIR store.
 * @returns {Promise<CommunicationResource>}
 */
const addCommunicationResource =
  (resource: CommunicationResource): Promise<CommunicationResource> =>
  new Promise((resolve, reject) => {
    axios.post(
      buildHearthUrl({
        host: config.get(EnvKeys.HearthHost) as string,
        port: config.get(EnvKeys.HearthPort) as PortNumber,
        secured: config.get(EnvKeys.HearthSecured) as boolean,
        path: `fhir/${fhirResources.COMMUNICATION}`
      }),
      resource)
      .then(() => resolve())
      .catch(err => reject(err.message));
  });

export default {
  addCommunicationRequest,
  addCommunicationResource
};
