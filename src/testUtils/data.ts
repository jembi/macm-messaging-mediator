'use strict';
import { CommunicationRequest } from '../communication_request/types';

export const validCommunicationRequest : CommunicationRequest = {
  resourceType: 'CommunicationRequest',
  status: 'active',
  contained: [{
    resourceType: 'Practitioner',
    id: 'practitioner',
    name: 'John Doe',
    telecom: {
      use: 'official',
      system: 'phone',
      value: '+27731234567'
    }
  }, {
    resourceType: 'Organization',
    id: 'requester',
    name: 'National Department of Health'
  }
  ],
  payload: {
    contentString: 'Text Message',
    contentAttachment: {
      title: 'Test results available',
      'content-type': 'text/plain',
      language: 'en'
    }
  },
  priority: 'valid',
  category: [{
    coding: {
      system: '1.3.6.1.4.1.19376.1.2.5.1',
      code: 'alert',
      display: 'Alert'
    },
    text: 'Alert message'
  }
  ],
  authoredOn: new Date(),
  requester: {
    agent: {
      reference: '#organization'
    }
  },
  recipient: [{
    reference: '#practitioner'
  }]
};
