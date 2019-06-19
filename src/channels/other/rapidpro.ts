'use strict';
import axios, { AxiosRequestConfig } from 'axios';
import {
  INotificationRequest,
  INotificationResponse,
  IWebhookResponse,
  MessagingService } from '../types';

interface Props {
  flowApiUrl: string;
  token: string;
  flow: string;
}

export default class RapidProService extends MessagingService {
  private identifierSystem = 'other:rapidpro';

  processNotification (notificationRequest: INotificationRequest): Promise<INotificationResponse> {
    return new Promise((resolve, reject) => {
      const props = notificationRequest.props as Props;

      const axiosConfig: AxiosRequestConfig = {
        data: {
          urns: notificationRequest.to.map(urn => `tel:${urn}`),
          flow: props.flow,
          extra: { message: notificationRequest.body }
        },
        url: props.flowApiUrl,
        method: 'post',
        headers: { Authorization: `Token ${props.token}` }
      };

      axios(axiosConfig).then((response: any) => resolve({
        id: response.data.uuid,
        status: 'in-progress',
        sent: response.data.created_on,
        identifierSystem: this.identifierSystem
      } as INotificationResponse)).catch(reject);
    });
  }

  processWebhook(data: any): Promise<IWebhookResponse> {
    return Promise.resolve({} as IWebhookResponse);
  }
}
