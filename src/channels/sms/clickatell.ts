'use strict';
import axios, { AxiosRequestConfig } from 'axios';
import { logger } from '../../utils';

import { 
  INotificationRequest,
  INotificationResponse,
  IWebhookResponse,
  MessagingService } from '../types';

import { CommunicationResource } from '../../types';

interface Props {
  clickatellApiKey: string;
  url: string;
}

interface WebhookData {
  messageId: string;
  requestId: string;
  clientMessageId: string;
  statusCode: string;
  status: string;
  statusDescription: string;
  timestamp: string;
}

/**
 * This is an untested Clickatell Service but is used to demonstrate the ease of 
 * channel creation with webhook configuration. With the Twilio channel the webhook is sent in the message request.
 * On Clickatell the webhook url must be configured on the clickatell portal. The webhook url configured must be
 * a POST to  http://<domain>/webhook/sms/clickatell
 */
export default class ClickatellService extends MessagingService {
  private identifierSystem = 'macm:sms:clickatell';
  
  constructor () {
    super();
  }

  processNotification (notificationRequest: INotificationRequest): Promise<INotificationResponse> {
    return new Promise((resolve, reject) => {
      const props = notificationRequest.props as Props;
      const clickatellApiKey = props.clickatellApiKey;

      const axiosConfig: AxiosRequestConfig = {
        method: 'GET',
        url: `${ props.url }`,
        params: {
          apiKey: `${ clickatellApiKey }`,
          to: notificationRequest.to[0],
          content: notificationRequest.body,
        },
      };

      axios(axiosConfig).then((response: any) => resolve(
        {
          id: response.data.messages[0].apiMessageId,
          status: 'in-progress',
          identifierSystem: this.identifierSystem
        } as INotificationResponse)).catch(reject);
    });
  }

  processWebhook (data: any): Promise<IWebhookResponse> {
    return  new Promise((resolve, reject) => {
      const webHookData = data as WebhookData;
      // TODO we need to ensure that all data relevant to this communication resource is made
      // known to the caller in ITI-85 suggestion is to store the full webookData object in 
      // the extension field.
      logger.info(JSON.stringify(webHookData));
      return webHookData ? resolve({
        id: webHookData.messageId,
        status: this.mapMessageStatus(webHookData.status),
        identifierSystem: this.identifierSystem
      } as IWebhookResponse) : reject(new Error('Invalid twilio webhook data'));
    });
  }

  // TODO check the statuses (complete and check failure ones)
  private mapMessageStatus (status: string) {
    switch (status) {
      case 'queued':
      case 'accepted':
      case 'DELIVERED_TO_GATEWAY':
        return 'in-progress';
      case 'RECEIVED_BY_RECIPIENT':
        return 'completed';
      case 'ERROR_DELIVERING':
      case 'ROUTING_ERROR':
      case 'MESSAGE_EXPIRED':
        return 'entered-in-error';
      default:
        throw new Error('Unknown Twilio message status');
    }
  }
};
