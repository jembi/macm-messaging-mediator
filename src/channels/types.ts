'use strict';

import { CommunicationResource } from '../communication/types';

export interface IChannel {
  /**
   * Processes a INotificationRequest and sends an alert/notification.
   *
   * @param {INotificationRequest} notificationRequest
   * @return {Promise<CommunicationResource>}
   */
  processNotification(notificationRequest: INotificationRequest) : Promise<INotificationResponse>;

  /**
   * Processes an API callback from the implemented messaging service.
   *
   * @param {any} data
   * @returns {Promise<CommunicationResource>}
   */
  processWebhook(data: any) : Promise<CommunicationResource>;

  /**
   * Processes a request for the delivery status of an alert/notification.
   * NOTE: This is an implementation of the IHE mACM profile transaction ITI-85
   *
   * @param {string} communicationRequestId
   * @returns {Promise<CommunicationResource>}
   */
  processStatusRequest(communicationRequestId: string) : Promise<CommunicationResource>;
}

/**
 * Represents parameters for a notification to be sent by channel.
 */
export interface INotificationRequest {
  to: string;
  body: string;
  props: Object;
}

/**
 * Represents a response from a channel.
 * NOTE: the status property should be that which acceptable in FHIR STU 3 Communication resource.
 */
export interface INotificationResponse {
  id: string;
  status: 'in-progress' | 'completed' | 'entered-in-error';
  sent: Date;
  identifierSystem: string;
}

export interface ChannelConfig {
  type: string;
  default?: boolean;
  services: ChannelService[];
}

export interface ChannelService {
  default?: boolean;
  name: string;
  props: any;
}
