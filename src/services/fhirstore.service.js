'use strict'
import axios from 'axios'
import config from '../config'
import { buildHearthUrl } from '../utils'
import { fhirResources, configOptions } from '../constants'

const addCommunicationRequest = async (resource) => {
  const hearthBaseUrl = buildHearthUrl({
    host: config.get(configOptions.HEARTH_HOST),
    port: config.get(configOptions.HEARTH_PORT),
    secured: config.get(configOptions.HEARTH_SCURED),
    path: `fhir/${fhirResources.COMMUNICATION_REQUEST}`
  })

  const response = await axios.post(hearthBaseUrl, resource)
  return response.data
}

const addCommunicationResource = resource => new Promise((resolve, reject) => resolve(resource))

export default {
  addCommunicationRequest,
  addCommunicationResource
}
