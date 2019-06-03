'use strict';
import { default as createError } from 'http-errors';
import * as Joi from 'joi';
import { default as config } from 'nconf';
import { Request, Response } from 'express';
import { communicationRequestSchema } from './schema';
import { fhirStore } from '../services';
import { send } from '../channels/rapidpro';
import { createOperationOutcome, getSeverityAndCode } from '../utils';
import { OperationOutcomeIssue, SeverityAndCode, OperationOutcome } from '../utils/types';
import { AddCommunicationRequestResponse, CommunicationRequest } from './types';
import { RapidProFlowBody } from '../channels/rapidpro/types';
import { EnvKeys } from '../constants';
import communication from '../communication';

/**
 * Map AddCommunicationRequestResponse to a RapidProFlowBody instance.
 *
 * @param {AddCommunicationRequestResponse} addCommunicationRequestResponse - The data to map from
 * @returns {RapidProFlowBody}
 */
export const rapidProDataAdapter =
  (addCommunicationRequestResponse: AddCommunicationRequestResponse) : RapidProFlowBody => {
    if (!addCommunicationRequestResponse || Object.keys(addCommunicationRequestResponse).length === 0) {
      throw new Error('"addCommunicationRequestResponse" is required.');
    }

    return {
      flow: config.get(EnvKeys.RapidProSmsFlowId),
      urns: addCommunicationRequestResponse.contactNumbers,
      extra: {
        message: addCommunicationRequestResponse.text
      }
    };
  };

export const addCommunicationRequest = async (req: Request, res: Response, next: Function) => {
  const validationResult = Joi.validate(req.body || {}, communicationRequestSchema);

  if (validationResult.error !== null) {
    return next(createError(400, validationResult.error.details[0].message));
  }

  const addCommunicationRequestResponse =
    await fhirStore.addCommunicationRequest(req.body as CommunicationRequest);
  const sendResponse = await send(await rapidProDataAdapter(addCommunicationRequestResponse));
  await fhirStore.addCommunicationResource(communication.createCommunicationResource(
    sendResponse, addCommunicationRequestResponse.communicationRequestReference));

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
