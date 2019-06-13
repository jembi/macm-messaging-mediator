'use strict';
import express, { Request, Response } from 'express';
import { default as config } from '../../src/config';
import { CommunicationRequest } from '../communication_request/types';
import { CommunicationResource } from '../communication/types';
import { INotificationResponse, IChannel, ChannelConfig, ChannelService, ChannelMetadataConfig } from './types';
import { createNotificationRequest, fromNotificationResponseToCommunicationResource } from './sms';
import { logger } from '../utils';
import { default as fhirService } from '../services/fhirstore.service';

export const getChannelAndService = (channel: string | undefined, service: string | undefined) => {
  const channelConfig: ChannelMetadataConfig[] = (config.get('channels') as ChannelConfig).metadata ||
    (() => { throw new Error('Missing configuration for "channels"'); });

  const matchedChannel: ChannelMetadataConfig =
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
  const [resourceChannel, resourceService] = resource.extension
    ? resource.extension[0].valueString.split(':')
    : [undefined, undefined];
  const { channelType, service } = getChannelAndService(resourceChannel, resourceService);

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

// @ts-ignore
export const processWebhook = ({ data, channelName, serviceName }): Promise<any> =>
  new Promise(async (resolve, reject) => {
    try {
      const { channelType, service } = getChannelAndService(channelName, serviceName);
      const channel = require(`./${channelType.type}/${service.name}`).default as IChannel;

      const response = await channel.processWebhook(data);
      const existingCommunicationResource =
        await fhirService.getCommunicationResources(response.id, 1) as CommunicationResource;

      await fhirService.addCommunicationResource({
        identifier: [{
          system: response.identifierSystem,
          value: response.id
        }],
        resourceType: 'Communication',
        status: response.status,
        basedOn: existingCommunicationResource.basedOn
      } as CommunicationResource);
      return resolve('Successful!');
    } catch (err) {
      return reject(err);
    }
  });

export const processStatusRequest = (communicationRequestId: string): Promise<CommunicationResource> =>
    Promise.reject(new Error('Not implemented'));

const handleWebhook = async (req: Request, res: Response) => {
  try {
    logger.info('Webhook call received.');

    const body = await processWebhook({
      data: req.body,
      channelName: req.params.channel,
      serviceName: req.params.service
    });
    logger.info('Webhook call successful.');

    res.status(200).end();
  } catch (err) {
    logger.error(err);
    res.status(200).end();
  }
};

const router = express.Router();
router.post('/:channel/:service', handleWebhook);

export const apiRouter = router;
