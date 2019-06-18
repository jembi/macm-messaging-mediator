'use strict';
import express, { Request, Response } from 'express';
import { default as config } from '../../src/config';
import { CommunicationRequest } from '../communication_request/types';
import { CommunicationResource } from '../communication/types';
import { INotificationResponse, IService, IChannel, ChannelConfig, ChannelService, ChannelMetadataConfig } from './types';
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
    serviceType: matchedService
  };
};

export const fromNotificationResponseToCommunicationResource =
(data: INotificationResponse, communicationRequestReference: string): CommunicationResource => ({
  identifier: [{
    system: data.identifierSystem,
    value: data.id
  }],
  resourceType: 'Communication',
  status: data.status,
  basedOn: {
    reference: communicationRequestReference
  },
  sent: data.sent
});

export const processCommunicationRequest = (resource: CommunicationRequest)
  : Promise<CommunicationResource> => {
  const channelExtension = resource.extension
    ? resource.extension.find(ext => ext.url === 'CommunicationRequest.channel')
    : undefined;

  const extensions = resource.extension
    ? resource.extension.filter(ext => ext.url !== 'CommunicationRequest.channel')
    : [];

  const [resourceChannel, resourceService] = channelExtension
    ? channelExtension.valueString.split(':')
    : [undefined, undefined];
  const { channelType, serviceType } = getChannelAndService(resourceChannel, resourceService);

  const service = require(`./${channelType.type}/${serviceType.name}`);
  const channel = require(`./${channelType.type}`);

  const serviceImpl = service.default as IService;
  const channelImpl = channel.default as IChannel;
  return new Promise((resolve, reject) =>
    serviceImpl.processNotification(channelImpl.createNotificationRequest(resource, serviceType.props, extensions))
      .then((response: INotificationResponse) =>
        resolve(fromNotificationResponseToCommunicationResource(response, `CommunicationRequest/${resource.id}`)))
      .catch(reject));
};

// @ts-ignore
export const processWebhook = ({ data, channelName, serviceName }): Promise<any> =>
  new Promise(async (resolve, reject) => {
    try {
      const { channelType, serviceType } = getChannelAndService(channelName, serviceName);
      const serviceImpl = require(`./${channelType.type}/${serviceType.name}`).default as IService;

      const response = await serviceImpl.processWebhook(data);

      const communicationResources = (await fhirService.getCommunicationResources(response.id))
        .map((comm: any) => comm.resource)
        .filter((comm: CommunicationResource) => comm.basedOn && typeof comm.basedOn !== undefined) ||
        (() => { throw new Error('CommunicationRequest reference is required for Communication resource'); });

      await fhirService.addCommunicationResource({
        identifier: [{
          system: response.identifierSystem,
          value: response.id
        }],
        resourceType: 'Communication',
        status: response.status,
        basedOn: {
          reference: communicationResources[0].basedOn.reference
        }
      } as CommunicationResource);
      return resolve('Successful!');
    } catch (err) {
      logger.error(err);
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
