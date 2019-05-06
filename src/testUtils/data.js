'use strict'
import { fhirResources } from '../constants'

export const validCommunicationRequest = {
  resourceType: fhirResources.COMMUNICATION_REQUEST,
  status: 'active',
  contained: [{
    resourceType: fhirResources.PRACTITIONER,
    id: 'practitioner',
    telecom: {
      use: 'official',
      system: 'phone',
      value: '+27731234567'
    }
  }, {
    resourceType: fhirResources.ORGANIZATION,
    id: 'requester',
    name: 'National Department of Health'
  }
  ],
  payload: {
    title: 'Test results available',
    'content-type': 'text/plain',
    language: 'en'
  },
  priority: 'routine',
  category: [{
    coding: {
      system: '1.3.6.1.4.1.19376.1.2.5.1',
      code: 'alert',
      display: 'Alert'
    },
    text: 'Alert message'
  }
  ],
  authoredOn: Date.now(),
  requester: [{
    reference: '#organization'
  }],
  recipient: [{
    reference: '#requester'
  }]
}
