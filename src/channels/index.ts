'use strict';
import { default as config } from '../../src/config';
import { CommunicationRequest } from '../communication_request/types';
import { CommunicationResource } from '../communication/types';
import { ISmsResponse, IChannel, ChannelConfig, ChannelService, ISmsChannel } from './types';
import { createSmsRequest, fromSmsResponseToCommunicationResource } from './sms';

const getChannelAndService = (resource: CommunicationRequest) => {
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
    channel: matchedChannel,
    service: matchedService
  };
};

const sendNotification = (resource: CommunicationRequest, channelType: string, service: ChannelService)
  : Promise<CommunicationResource> => {
  const channel = require(`./${channelType}/${service.name}`);

  switch (channelType) {
    case 'sms':
      const smsChannel = channel as ISmsChannel;
      return new Promise((resolve, reject) => smsChannel.send(createSmsRequest(resource, service.props))
        .then((response: ISmsResponse) =>
          resolve(fromSmsResponseToCommunicationResource(response, `CommunicationRequest/${resource.id}`)))
        .catch(reject));
    default:
      return Promise.reject(new Error(`Unknown channel channel type ${channelType}`));
  }
};

const channel: IChannel = {
  processNotifaction: (resource: CommunicationRequest): Promise<CommunicationResource> => {
    const { channel, service } = getChannelAndService(resource);
    return sendNotification(resource, channel.type, service);
  },

  processWebhook: (data: any): Promise<CommunicationResource> => Promise.reject(new Error('Not implemented')),
  processStatusRequest: (communicationRequestId: string): Promise<CommunicationResource> =>
    Promise.reject(new Error('Not implemented'))
};

export default channel;
