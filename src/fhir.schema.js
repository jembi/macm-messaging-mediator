'use strict'
import Joi from 'joi'
import { COMMUNICATION_REQUEST } from './contants'

export const CommunicationRequestSchema = Joi.object().keys({
  resourceType: Joi.string().valid(COMMUNICATION_REQUEST).required()
})
