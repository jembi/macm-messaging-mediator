'use strict'
import Joi from 'joi'
import {
  COMMUNICATION_REQUEST,
  COMMUNICATION_REQUEST_ACTIVE_STATUS } from './contants'

export const CommunicationRequestSchema = Joi.object().keys({
  resourceType: Joi.string().valid(COMMUNICATION_REQUEST).required(),
  status: Joi.string()
    .valid(COMMUNICATION_REQUEST_ACTIVE_STATUS)
    .required()
    .error(() => Object.assign({ message: `Resource status is required and must be '${COMMUNICATION_REQUEST_ACTIVE_STATUS}'` }, {}))
})
