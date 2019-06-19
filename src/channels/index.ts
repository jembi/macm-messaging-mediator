'use strict';
import express, { Request, Response } from 'express';
import { default as config } from '../../src/config';
import { CommunicationRequest, CommunicationResource } from '../types';
import {
  INotificationResponse,
  IChannel,
  ChannelConfig,
  ChannelService,
  ChannelMetadataConfig,
  MessagingService} from './types';
import { logger } from '../utils';
import { default as fhirService } from '../fhirstore';

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

  const service = require(`./${channelType.type}/${serviceType.name}`).default;
  const channel = require(`./${channelType.type}`);

  const serviceImpl = new service() as MessagingService;

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
      const service = require(`./${channelType.type}/${serviceType.name}`).default;
      const serviceImpl = new service();

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

// @ts-ignore
export const processStatusRequestById = ({ resource, id, searchParams, channel, serviceName }): Promise<any> =>
  new Promise((resolve, reject) => {
    const { channelType, serviceType } = getChannelAndService(channel, serviceName);
    const service = require(`./${channelType.type}/${serviceType.name}`).default;

    const serviceImpl = new service() as MessagingService;

    serviceImpl
      .processStatusRequestById(id, resource, searchParams)
      .then(resolve)
      .catch(reject);
  });

// @ts-ignore
export const processStatusRequest = ({ resource, searchParams, channel, serviceName }): Promise<any> =>
new Promise((resolve, reject) => {
  const { channelType, serviceType } = getChannelAndService(channel, serviceName);
  const service = require(`./${channelType.type}/${serviceType.name}`).default;

  const serviceImpl = new service() as MessagingService;

  serviceImpl
    .processStatusRequest(resource, searchParams)
    .then(resolve)
    .catch(reject);
});
