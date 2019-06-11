'use strict';
import express, { Request, Response } from 'express';
import { default as config } from '../../src/config';
import { CommunicationRequest } from '../communication_request/types';
import { CommunicationResource } from '../communication/types';
import { INotificationResponse, IChannel, ChannelConfig, ChannelService } from './types';
import { createNotificationRequest, fromNotificationResponseToCommunicationResource } from './sms';
import { wrapHandler } from '../utils';

export const getChannelAndService = (resource: CommunicationRequest) => {
  const channelConfig: ChannelConfig[] = config.get('channels') ||
    (() => { throw new Error('Missing configuration for "channels"'); });

  const [channel, service] = resource.extension
    ? resource.extension[0].valueString.split(':')
    : [undefined, undefined];

  const matchedChannel: ChannelConfig =
    channelConfig.find(cfg => cfg.type.toLowerCase() === channel) ||
    channelConfig.find(cfg => cfg.default || false) ||
    (() => { throw new Error('No default channel for CommunicationRequest'); })();

  const matchedService: ChannelService =
    matchedChannel.services.find(cfg => cfg.name.toLowerCase() === service) ||
    matchedChannel.services.find(cfg => cfg.default || false) ||
    (() => { throw new Error('No default service'); })();

  return {
    channelType: matchedChannel,
    service: matchedService
  };
};

export const processCommunicationRequest = (resource: CommunicationRequest)
  : Promise<CommunicationResource> => {
  const { channelType, service } = getChannelAndService(resource);

  const channel = require(`./${channelType.type}/${service.name}`);
  switch (channelType.type) {
    case 'sms':
      const smsChannel = channel.default as IChannel;
      return new Promise((resolve, reject) =>
        smsChannel.processNotification(createNotificationRequest(resource, service.props))
        .then((response: INotificationResponse) =>
          resolve(fromNotificationResponseToCommunicationResource(response, `CommunicationRequest/${resource.id}`)))
        .catch(reject));
    default:
      return Promise.reject(new Error(`Unknown channel channel type ${channelType}`));
  }
};

export const processWebhook = (data: any): Promise<CommunicationResource> =>
  Promise.resolve(data);

export const processStatusRequest = (communicationRequestId: string): Promise<CommunicationResource> =>
    Promise.reject(new Error('Not implemented'));

const handleWebhook = async (req: Request, res: Response, next: Function) => {
  const body = await processWebhook(req.body);
  console.log(`Body: ${JSON.stringify(body)}`);
  res.status(200).end();
};

const router = express.Router();
router.post('/', wrapHandler(handleWebhook));

export const apiRouter = router;
