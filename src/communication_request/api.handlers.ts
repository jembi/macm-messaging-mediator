'use strict';
import { default as createError } from 'http-errors';
import * as Joi from 'joi';
import * as R from 'ramda';
import { Request, Response } from 'express';
import { communicationRequestSchema } from './schema';
import { fhirStore, rapidPro } from '../services';
import { createOperationOutcome, getSeverityAndCode } from '../utils';
import { OperationOutcomeIssue, SeverityAndCode, OperationOutcome } from '../utils/types';
import { AddCommunicationRequestResponse } from './types';

const createCommunicationResource = (communicationRequest: AddCommunicationRequestResponse) =>
  new Promise((resolve, reject) => resolve(communicationRequest));

const createResponse =
  (communicationResource: AddCommunicationRequestResponse) : Promise<AddCommunicationRequestResponse> =>
    new Promise((resolve, reject) => resolve(communicationResource));

export const addCommunicationRequest = async (req: Request, res: Response, next: Function) => {
  const validationResult = Joi.validate(req.body || {}, communicationRequestSchema);

  if (validationResult.error !== null) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  const sendMessage = R.composeP(
    createResponse,
    fhirStore.addCommunicationResource,
    rapidPro.send,
    createCommunicationResource,
    fhirStore.addCommunicationRequest
  );

  const response = await sendMessage(req.body);
  const severityAndCode : SeverityAndCode = getSeverityAndCode(202);
  const issue : OperationOutcomeIssue = {
    severity: severityAndCode.severity,
    code: severityAndCode.code,
    text: 'Accepted'
  };

  const operationOutcome : OperationOutcome = createOperationOutcome([issue]);
  res.setHeader('Location', response.communicationRequestReference);
  return res.status(202).json(operationOutcome);
};
