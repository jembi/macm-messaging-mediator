'use strict';
import { default as createError } from 'http-errors';
import express, { Request, Response } from 'express';
import * as Joi from 'joi';
import * as Utils from './utils';
import * as Channels from './channels';
import { communicationRequestSchema } from './schema';
import { default as FhirStore } from './fhirstore';
import {
  SeverityAndCode,
  OperationOutcomeIssue,
  OperationOutcome,
  CommunicationRequest } from './types';

const router = express.Router();

router.get('/:channel/:service/:resource/:id', Utils.wrapHandler(async (req: Request, res: Response) =>
  res.status(200).json(await Channels.processStatusRequestById({
    resource: req.params.resource,
    id: req.params.id,
    searchParams: req.query,
    channel: req.params.channel,
    serviceName: req.params.service
  }))
));

router.get('/:channel/:service/:resource', Utils.wrapHandler(async (req: Request, res: Response) =>
  res.status(200).json(await Channels.processStatusRequest({
    resource: req.params.resource,
    searchParams: req.query,
    channel: req.params.channel,
    serviceName: req.params.service
  }))
));

router.post('/webhook/:channel/:service', async (req: Request, res: Response) => {
  try {
    Utils.logger.info('Webhook call received.');

    const body = await Channels.processWebhook({
      data: req.body,
      channelName: req.params.channel,
      serviceName: req.params.service
    });
    Utils.logger.info('Webhook call successful.');

    res.status(200).end();
  } catch (err) {
    Utils.logger.error(err);
    res.status(200).end();
  }
})

router.post('/communicationrequest', Utils.wrapHandler(async (req: Request, res: Response, next: Function) => {
  const validationResult = Joi.validate(req.body || {}, communicationRequestSchema);

  if (validationResult.error !== null) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  const addCommunicationRequestResponse = await FhirStore.addCommunicationRequest(req.body as CommunicationRequest);

  const updatedCommunicationRequest = Utils.deepClone(req.body) as CommunicationRequest;
  updatedCommunicationRequest.id = addCommunicationRequestResponse.communicationRequestReference.split('/')[1];

  const communication = await Channels.processCommunicationRequest(updatedCommunicationRequest);
  await FhirStore.addCommunicationResource(communication);

  const severityAndCode : SeverityAndCode = Utils.getSeverityAndCode(202);
  const issue : OperationOutcomeIssue = {
    severity: severityAndCode.severity,
    code: severityAndCode.code,
    details: {
      text: 'Accepted'
    }
  };

  const operationOutcome : OperationOutcome = Utils.createOperationOutcome([issue]);
  res.setHeader('Location', addCommunicationRequestResponse.communicationRequestReference);
  return res.status(202).json(operationOutcome);
}));

export default router;
