'use strict';
import axios from 'axios';
import config from '../../config';
import { EnvKeys } from '../../constants';
import { RapidProFlowBody, SendResponse } from './types';

/**
 * Trigger a RapidPro flow for sending a message to recepients.
 *
 * @param {RapidProFlowBody} data - The data to be sent to RapidPro
 * @returns {Promise<SendResponse>}
 */
export const send = (data: RapidProFlowBody) : Promise<SendResponse> =>
  new Promise((resolve, reject) => {
    const axiosConfig = {
      data,
      url: `${config.get(EnvKeys.RapidProApiUrl)}/flow_starts.json`,
      method: 'post',
      headers: {
        Authorization: `Token ${config.get(EnvKeys.RapidProApiKey)}`
      }
    };

    axios(axiosConfig).then((response) => {
      const res : SendResponse = {
        id: response.data.id,
        uuid: response.data.uuid,
        status: response.data.status,
        created_on: response.data.created_on,
        modified_on: response.data.modified_on
      };
      resolve(res);
    }).catch(reject);
  });
