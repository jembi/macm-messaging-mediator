'use strict';
import { default as config } from '../../src/config';
import { CommunicationRequest } from '../communication_request/types';
import { CommunicationResource } from '../communication/types';
import { INotificationResponse, IChannel, ChannelConfig, ChannelService } from './types';
import { createNotificationRequest, fromNotificationResponseToCommunicationResource } from './sms';

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
  console.log(channelType);
  
  const channel = require(`./${channelType.type}/${service.name}`);
  switch (channelType.type) {
    case 'sms':
      const smsChannel = channel.default as IChannel;
      console.log(smsChannel);
      return new Promise((resolve, reject) => smsChannel.processNotification(createNotificationRequest(resource, service.props))
        .then((response: INotificationResponse) =>
          resolve(fromNotificationResponseToCommunicationResource(response, `CommunicationRequest/${resource.id}`)))
        .catch(reject));
    default:
      return Promise.reject(new Error(`Unknown channel channel type ${channelType}`));
  }
};

export const processWebhook = (data: any): Promise<CommunicationResource> => Promise.reject(new Error('Not implemented'));

export const processStatusRequest = (communicationRequestId: string): Promise<CommunicationResource> =>
    Promise.reject(new Error('Not implemented'));