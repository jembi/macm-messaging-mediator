'use strict';

import { CommunicationRequest } from '../communication_request/types';
import { PortNumber, ResourceType } from '../utils/types';
import { default as fhirStore } from '../../src/services/fhirstore.service';
import { buildHearthUrl } from '../utils';
import config from '../../src/config';
import { EnvKeys } from '../constants';

export abstract class MessagingService {
  /**
   * Processes a INotificationRequest and sends an alert/notification.
   *
   * @param {INotificationRequest} notificationRequest
   * @return {Promise<CommunicationResource>}
   */
  abstract processNotification(notificationRequest: INotificationRequest) : Promise<INotificationResponse>;

  /**
   * Processes an API callback from the implemented messaging service.
   *
   * @param {any} data
   * @returns {Promise<CommunicationResource>}
   */
  abstract processWebhook(data: any) : Promise<IWebhookResponse>;

  /**
   * Processes a request for the delivery status of an alert/notification.
   * NOTE: This is an implementation of the IHE mACM profile transaction ITI-85
   *
   * @param {string} communicationRequestId
   * @returns {Promise<CommunicationResource>}
   */
  processStatusRequest(resource: ResourceType, params: Object)
    : Promise<any> {
    return new Promise((resolve, reject) => {
      const fhirStoreUrl = buildHearthUrl({
        host: config.get(EnvKeys.HearthHost) as string,
        port: config.get(EnvKeys.HearthPort) as PortNumber,
        secured: config.get(EnvKeys.HearthSecured) as boolean,
        path: `fhir/${resource}`
      });

      fhirStore
        .searchForResources(fhirStoreUrl, params)
        .then(resolve)
        .catch(reject);
    });
  }

  processStatusRequestById(id: string, resource: ResourceType, params: Object)
    : Promise<any> {
    return new Promise((resolve, reject) => {
      const fhirStoreUrl = buildHearthUrl({
        host: config.get(EnvKeys.HearthHost) as string,
        port: config.get(EnvKeys.HearthPort) as PortNumber,
        secured: config.get(EnvKeys.HearthSecured) as boolean,
        path: `fhir/${resource}/${id}`
      });

      fhirStore
        .searchForResources(fhirStoreUrl, params)
        .then(resolve)
        .catch(reject);
    });
  }
}

export interface IChannel {
  /**
   * Transform a CommunicationRequest into an object that conforms to INotificationRequest interface
   *
   * @param {CommunicationRequest} communicationRequest
   * @return {INotificationRequest}
   */
  createNotificationRequest (communicationRequest: CommunicationRequest, props: Object, extensions: Object[])
    : INotificationRequest;
}

/**
 * Represents parameters for a notification to be sent by channel.
 */
export interface INotificationRequest {
  to: string[];
  body: string;
  props: Object;
  extensions: Object[];
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

/**
 * Represents a response from a channel.
 * NOTE: the status property should be that which acceptable in FHIR STU 3 Communication resource.
 */
export interface IWebhookResponse {
  id: string;
  status: 'in-progress' | 'completed' | 'entered-in-error';
  identifierSystem: string;
}

export interface ChannelConfig {
  webhook: WebhookConfig | undefined;
  metadata: ChannelMetadataConfig[];
}

export interface WebhookConfig {
  host: string;
  port: PortNumber | undefined;
  protocol: 'https' | 'http';
}

export interface ChannelMetadataConfig {
  type: string;
  default?: boolean;
  services: ChannelService[];
}

export interface ChannelService {
  default?: boolean;
  name: string;
  props: any;
}
