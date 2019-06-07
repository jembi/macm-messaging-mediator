'use strict';
import { default as smsChannel } from './sms/twilio';
import { CommunicationRequest } from '../communication_request/types';
import { CommunicationResource } from '../communication/types';
import { ISmsrequest, ISmsResponse, IChannel } from './types';

/**
 * Parses a CommunicationRequest resource and returns a collection of recipient contact numbers.
 *
 * @param {CommunicationRequest} resource - The resource containing recipient contact numbers.
 * @returns {Array} - A collection of contact numbers.
 */
export const getRecipientContactNumbers = (resource: CommunicationRequest) : string[] =>
  resource && resource.contained ? resource.contained
    .filter(containedResource =>
      containedResource.id === resource.recipient[0].reference.substring(1) &&
        containedResource.telecom &&
        containedResource.telecom.system === 'phone' &&
        containedResource.telecom.value
    )
    .map(containedResource => containedResource.telecom &&
      containedResource.telecom.value ? `tel:${containedResource.telecom.value}` : '')
    : [];

/**
 * Parses a CommunicationRequest resource and returns a text message string.
 *
 * @param {CommunicationRequest} resource - The resource containing the text message.
 * @returns {string}
 */
export const getTextMessage = (resource: CommunicationRequest): string => resource.payload.contentString || '';

const createSmsRequest = (communicationRequest: CommunicationRequest) : ISmsrequest => ({
  body: getTextMessage(communicationRequest),
  // TODO: Change sms channel to handle mupltiple contact numbers.
  to: getRecipientContactNumbers(communicationRequest)[0]
});

const fromSmsResponseToCommunicationResource =
  (data: ISmsResponse, communicationRequestReference: string): CommunicationResource => ({
    resourceType: 'Communication',
    status: data.status,
    basedOn: {
      reference: communicationRequestReference
    },
    sent: data.sent
  });

const processNotifaction = async (communicationRequest: CommunicationRequest) : Promise<CommunicationResource> => {
  return new Promise((resolve, reject) =>
    // TODO: Logic to decide on channel to use
    smsChannel.send(createSmsRequest(communicationRequest))
      .then((response: ISmsResponse) =>
        resolve(fromSmsResponseToCommunicationResource(response, `CommunicationRequest/${communicationRequest.id}`)))
      .catch(error => reject(error)));
};

const channel : IChannel = {
  processNotifaction,
  processWebhook: (data: any) : Promise<CommunicationResource> => Promise.reject(new Error('Not implemented')),
  processStatusRequest: (communicationRequestId: string) : Promise<CommunicationResource> =>
    Promise.reject(new Error('Not implemented'))
};

export default channel;
