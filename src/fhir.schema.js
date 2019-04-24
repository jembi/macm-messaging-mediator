'use strict'
import Joi from 'joi'
import {
  fhirResources,
  statuses,
  fhirTelecomSystems,
  fhirPriorities } from './constants'

const ALERT_REGEX = /^alert$/i

const PayloadSchema = {
  title: Joi.string().max(50).required(),
  'content-type': Joi.string().valid('text/plain').required(),
  language: Joi.string().valid('en').required()
}

const TelecomSchema = {
  use: Joi.string().max(20).required(),
  system: Joi.string().valid(fhirTelecomSystems.PHONE).required(),
  value: Joi.string().max(13).required()
}

const ContainedResourcesSchema = {
  resourceType: Joi.valid([fhirResources.ORGANIZATION, fhirResources.PRACTITIONER]).required(),
  id: Joi.string().max(20).required(),
  name: Joi.string().max(50).optional(),
  telecom: Joi.object(TelecomSchema).optional()
}

const CategorySchema = {
  coding: Joi.object({
    system: Joi.string().valid('1.3.6.1.4.1.19376.1.2.5.1').required(),
    code: Joi.string().regex(ALERT_REGEX).required(),
    display: Joi.string().regex(ALERT_REGEX).required()
  }),
  text: Joi.string().max(100).optional()
}

const ReferenceSchema = {
  reference: Joi.string().max(21).required()
}

const statusErrorMessage = () => Object.assign({
  message: `Resource status is required and must be '${statuses.ACTIVE}'`
}, {})

export const CommunicationRequestSchema = Joi.object({
  resourceType: Joi.string().valid(fhirResources.COMMUNICATION_REQUEST).required(),
  status: Joi.string().valid(statuses.ACTIVE).required().error(statusErrorMessage),
  payload: Joi.object().keys(PayloadSchema),
  contained: Joi.array().items(ContainedResourcesSchema).length(2),
  priority: Joi.string().valid(fhirPriorities.ROUTINE),
  category: Joi.array().items(CategorySchema).length(1),
  authoredOn: Joi.date().required(),
  requester: Joi.array().items(ReferenceSchema).length(1),
  recipient: Joi.array().items(ReferenceSchema).length(1)
})
