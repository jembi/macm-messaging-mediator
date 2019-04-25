'use strict'
import createError from 'http-errors'
import Joi from 'joi'
import R from 'ramda'
import { CommunicationRequestSchema } from './schema'
import { fhirStore, rapidPro } from '../services'

const createCommunicationResource = communicationRequest => new Promise((resolve, reject) => resolve())

const createResponse = communicationResource => new Promise((resolve, reject) => resolve())

export const addCommunicationRequest = async (req, res, next) => {
  const validationResult = Joi.validate(req.body || {}, CommunicationRequestSchema)

  if (validationResult.error !== null) {
    return next(createError(400, validationResult.error.details[0].message))
  }

  const sendMessage = R.composeP(
    createResponse,
    fhirStore.addCommunicationResource,
    rapidPro.send,
    createCommunicationResource,
    fhirStore.addCommunicationRequest
  )

  const response = await sendMessage(req.body)
  return res.status(202).json(response)
}
