'use strict';
import { default as createError } from 'http-errors';
import * as Joi from 'joi';
import { Request, Response } from 'express';
import { communicationRequestSchema } from './schema';
import { fhirStore } from '../services';
import { processCommunicationRequest } from '../channels';
import { createOperationOutcome, getSeverityAndCode, deepClone } from '../utils';
import { OperationOutcomeIssue, SeverityAndCode, OperationOutcome } from '../utils/types';
import { CommunicationRequest } from './types';

export const addCommunicationRequest = async (req: Request, res: Response, next: Function) => {
  const validationResult = Joi.validate(req.body || {}, communicationRequestSchema);

  if (validationResult.error !== null) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  const addCommunicationRequestResponse = await fhirStore.addCommunicationRequest(req.body as CommunicationRequest);

  const updatedCommunicationRequest = deepClone(req.body) as CommunicationRequest;
  updatedCommunicationRequest.id = addCommunicationRequestResponse.communicationRequestReference.split('/')[1];

  const communication = await processCommunicationRequest(updatedCommunicationRequest);
  await fhirStore.addCommunicationResource(communication);

  const severityAndCode : SeverityAndCode = getSeverityAndCode(202);
  const issue : OperationOutcomeIssue = {
    severity: severityAndCode.severity,
    code: severityAndCode.code,
    details: {
      text: 'Accepted'
    }
  };

  const operationOutcome : OperationOutcome = createOperationOutcome([issue]);
  res.setHeader('Location', addCommunicationRequestResponse.communicationRequestReference);
  return res.status(202).json(operationOutcome);
};

export const getCommunicationRequests = async (req: Request, res: Response, next: Function) =>
  res
    .status(200)
    .json(await fhirStore.getCommunicationRequests(req.query));
