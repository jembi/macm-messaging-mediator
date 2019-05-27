'use strict';
import express from 'express';
import cors from 'cors';
import { SendResponse } from '../channels/rapidpro/types';
import { CommunicationResource, Status } from './types';
import { communicationRapidProCallback } from './api.handlers';
import { wrapHandler } from '../utils';

/**
 * Create a Communication resource
 *
 * @param {SendResponse} data - The data source to create a communication resource from
 * @param {string} communicationRequestReference - A reference to the CommunicationRequest
 */
const createCommunicationResource =
  (data: SendResponse, communicationRequestReference: string): CommunicationResource => ({
    resourceType: 'Communication',
    status: data.status as Status,
    basedOn: {
      reference: communicationRequestReference
    },
    sent: data.created_on
  });

const router = express.Router();
router.post('/', cors(), wrapHandler(communicationRapidProCallback));

export default {
  createCommunicationResource,
  apiRouter: router
};
