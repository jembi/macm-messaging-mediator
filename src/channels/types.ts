'use strict';
import { CommunicationRequest } from '../communication_request/types';
import { CommunicationResource } from '../communication/types';

export interface IChannel {
  /**
   * Processes a CommunicationRequest and sends an alert/notification.
   *
   * @param {CommunicationRequest} communicationRequest
   * @return {Promise<CommunicationResource>}
   */
  processNotifaction(communicationRequest: CommunicationRequest) : Promise<CommunicationResource>;

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
 * Represents parameters for an sms to be sent by channel.
 */
export interface ISmsrequest {
  to: string;
  body: string;
}

/**
 * Represents a response from a channel.
 * NOTE: the status property should be that which acceptable in FHIR STU 3 Communication resource.
 */
export interface ISmsResponse {
  id: string;
  status: 'in-progress' | 'completed' | 'entered-in-error';
  sent: Date;
  identifierSystem: string;
}

export interface ISmsChannel {
  /**
   * Sends an sms to a given recipient.
   *
   * @param {ISmsrequest} request
   * @return {Promise<ISmsResponse>}
   */
  send(request: ISmsrequest) : Promise<ISmsResponse>;
}
