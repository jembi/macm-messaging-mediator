'use strict';
import { default as Twilio } from 'twilio';
import { CommunicationResource } from '../../communication/types';
import { INotificationRequest, INotificationResponse, IChannel, IWebhookResponse } from '../types';
import { MessageInstance } from 'twilio/lib/rest/chat/v2/service/channel/message';

const IDENTIFIER_SYSTEM = 'macm:sms:twilio';

interface Props {
  sid: string;
  token: string;
  from: string;
  statusCallback: string;
}

interface WebhookData {
  SmsSid: string;
  SmsStatus: string;
  MessageStatus: string;
  To: string;
  MessageSid: string;
  AccountSid: string;
  From: string;
  ApiVersion: string;
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

const toSmsResponse = (message: any) : INotificationResponse => ({
  id: message.sid,
  sent: message.dateCreated,
  status: getMessageStatus(message.status),
  identifierSystem: IDENTIFIER_SYSTEM
});

const channel: IChannel = {
  processNotification: (notificationRequest: INotificationRequest) : Promise<INotificationResponse> =>
    new Promise((resolve, reject) => {
      const props = notificationRequest.props as Props;
      const client = Twilio(props.sid, props.token);

      client.messages.create({ from: props.from, to: notificationRequest.to, body: notificationRequest.body })
      // @ts-ignore
      .then((message: MessageInstance) => resolve(toSmsResponse(message)))
      .catch(reject);
    }),

  // TODO: Implment as part of the ISmsChannel interface
  processWebhook: (data: any) : Promise<IWebhookResponse> =>
    new Promise((resolve, reject) => {
      const webHookData = data as WebhookData;

      return webHookData ? resolve({
        id: webHookData.MessageSid,
        status: webHookData.MessageStatus,
        identifierSystem: IDENTIFIER_SYSTEM
      } as IWebhookResponse) : reject(new Error('Invalid twilio webhook data'));
    }),

  // TODO: Implment as part of the ISmsChannel interface
  processStatusRequest: (communicationRequestId: string) : Promise<CommunicationResource> =>
    Promise.reject(new Error('Not implemented'))
};

export default channel;
