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
