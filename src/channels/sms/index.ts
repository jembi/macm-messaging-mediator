'use strict';
import { INotificationResponse, INotificationRequest } from '../types';
import { CommunicationResource } from '../../communication/types';
import { CommunicationRequest } from '../../communication_request/types';

export const fromNotificationResponseToCommunicationResource =
  (data: INotificationResponse, communicationRequestReference: string): CommunicationResource => ({
    identifier: [{
      system: data.identifierSystem,
      value: data.id
    }],
    resourceType: 'Communication',
    status: data.status,
    basedOn: {
      reference: communicationRequestReference
    },
    sent: data.sent
  });

/**
 * Parses a CommunicationRequest resource and returns a collection of recipient contact numbers.
 *
 * @param {CommunicationRequest} resource - The resource containing recipient contact numbers.
 * @returns {Array} - A collection of contact numbers.
 */
export const getRecipientContactNumbers = (resource: CommunicationRequest): string[] =>
  resource && resource.contained ? resource.contained
    .filter(containedResource =>
      containedResource.id === resource.recipient[0].reference.substring(1) &&
      containedResource.telecom &&
      containedResource.telecom.system === 'phone' &&
      containedResource.telecom.value
    )
    .map(containedResource => containedResource.telecom &&
      containedResource.telecom.value ? containedResource.telecom.value : '')
    : [];

/**
 * Parses a CommunicationRequest resource and returns a text message string.
 *
 * @param {CommunicationRequest} resource - The resource containing the text message.
 * @returns {string}
 */
export const getTextMessage = (resource: CommunicationRequest): string => resource.payload.contentString || '';

export const createNotificationRequest =
  (communicationRequest: CommunicationRequest, props: Object, extensions: Object[]): INotificationRequest =>
    ({
      props,
      extensions,
      body: getTextMessage(communicationRequest),
      // TODO: Change sms channel to handle mupltiple contact numbers.
      to: getRecipientContactNumbers(communicationRequest)[0]
    });
