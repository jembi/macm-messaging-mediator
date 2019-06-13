'use strict';
import axios, { AxiosRequestConfig } from 'axios';
import { IChannel, INotificationRequest, INotificationResponse, IWebhookResponse } from '../types';
import { CommunicationResource } from '../../communication/types';

interface Props {
  flowApiUrl: string;
  token: string;
  flow: string;
}

const processNotification = (notificationRequest: INotificationRequest) : Promise<INotificationResponse> =>
  new Promise((resolve, reject) => {
    const props = notificationRequest.props as Props;

    const axiosConfig : AxiosRequestConfig = {
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
      sent: response.data.created_on
    } as INotificationResponse)).catch(reject);
  });

const channel : IChannel = {
  processNotification,
  processWebhook: (data: any) : Promise<IWebhookResponse> => Promise.reject(new Error('Not implemented')),
  processStatusRequest: (communicationRequestId: string) : Promise<CommunicationResource> =>
    Promise.reject(new Error('Not implemented'))
};

export default channel;
