'use strict';
import createError from 'http-errors';
import * as Joi from 'joi';
import * as R from 'ramda';
import { Request, Response } from 'express';
import { communicationRequestSchema } from './schema';
import { fhirStore, rapidPro } from '../services';

const createCommunicationResource = (communicationRequest: any) =>
  new Promise((resolve, reject) => resolve(communicationRequest));

const createResponse = (communicationResource: any) =>
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
  return res.status(202).json(response);
};
