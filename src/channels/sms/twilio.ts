'use strict';
import { default as Twilio } from 'twilio';
import { CommunicationResource } from '../../communication/types';
import { ISmsrequest, ISmsResponse, ISmsChannel } from '../types';
import { MessageInstance } from 'twilio/lib/rest/chat/v2/service/channel/message';

interface Props {
  sid: string;
  token: string;
  from: string;
}

const getMessageStatus = (status: string) => {
  switch (status) {
    case 'queued':
    case 'accepted':
    case 'sent':
      return 'in-progress';
    case 'delivered':
      return 'completed';
    case 'failed':
    case 'undelivered':
      return 'entered-in-error';
    default:
      throw new Error('Unknown Twilio message status');
  }
};

const toSmsResponse = (message: any) : ISmsResponse => ({
  id: message.sid,
  sent: message.dateCreated,
  status: getMessageStatus(message.status),
  identifierSystem: 'macm:sms:twilio'
});

const send = (request: ISmsrequest) : Promise<ISmsResponse> =>
  new Promise((resolve, reject) => {
    const props = request.props as Props;
    const client = Twilio(props.sid, props.token);

    client.messages.create({ from: props.from, to: request.to, body: request.body })
    // @ts-ignore
    .then((message: MessageInstance) => resolve(toSmsResponse(message)))
    .catch(reject);
  });

// TODO: Implment as part of the ISmsChannel interface
const  processWebhook = (data: any) : Promise<CommunicationResource> => Promise.reject(new Error('Not implemented'));
// TODO: Implment as part of the ISmsChannel interface
const processStatusRequest = (communicationRequestId: string) : Promise<CommunicationResource> =>
  Promise.reject(new Error('Not implemented'));

// @ts-ignore
const channel : ISmsChannel = {
  send
};

export default channel;
