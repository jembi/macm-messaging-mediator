'use strict';
import config from '../../../config';
import axios, { AxiosRequestConfig } from 'axios';
import { EnvKeys } from '../../../constants';
import { RapidProFlowBody, SendResponse } from './types';
import { IChannel, INotificationRequest, INotificationResponse, IWebhookResponse } from '../../types';
import { CommunicationResource } from '../../../communication/types';

interface Props {
  flowApiUrl: string;
  token: string;
  flow: string;
}

/**
 * Trigger a RapidPro flow for sending a message to recepients.
 *
 * @param {RapidProFlowBody} data - The data to be sent to RapidPro
 * @returns {Promise<SendResponse>}
 */
export const send = (data: RapidProFlowBody) : Promise<SendResponse> =>
  new Promise((resolve, reject) => {
    const axiosConfig : AxiosRequestConfig = {
      data,
      url: `${config.get(EnvKeys.RapidProApiUrl)}/flow_starts.json`,
      method: 'post',
      headers: {
        Authorization: `Token ${config.get(EnvKeys.RapidProApiKey)}`
      }
    };

    axios(axiosConfig).then((response: any) => resolve({
      id: response.data.id,
      uuid: response.data.uuid,
      status: response.data.status,
      created_on: response.data.created_on,
      modified_on: response.data.modified_on
    } as SendResponse)).catch(reject);
  });

const channel : IChannel = {
  processNotification: (notificationRequest: INotificationRequest) : Promise<INotificationResponse> =>
    // @ts-ignore
    Promise.resolve({}),
  processWebhook: (data: any) : Promise<IWebhookResponse> => Promise.reject(new Error('Not implemented')),

  processStatusRequest: (communicationRequestId: string) : Promise<CommunicationResource> =>
    Promise.reject(new Error('Not implemented'))
};

export default channel;
