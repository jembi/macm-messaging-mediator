'use strict';
import { default as Twilio } from 'twilio';
import {
  INotificationRequest,
  INotificationResponse,
  IWebhookResponse,
  MessagingService } from '../types';
import { MessageInstance } from 'twilio/lib/rest/chat/v2/service/channel/message';
import { createCallbackUrl } from '../../utils';

interface Props {
  sid: string;
  token: string;
  from: string;
  webhookActive: boolean;
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

export default class TwilioService extends MessagingService {
  private identifierSystem = 'macm:sms:twilio';

  constructor () {
    super();
  }

  processNotification (notificationRequest: INotificationRequest): Promise<INotificationResponse> {
    return new Promise((resolve, reject) => {
      const props = notificationRequest.props as Props;

      const clientParams = {
        from: props.from,
        to: notificationRequest.to[0],
        body: notificationRequest.body
      };

      if (props.webhookActive) {
        // @ts-ignore
        clientParams.statusCallback = createCallbackUrl('sms', 'twilio');
      }

      const client = Twilio(props.sid, props.token);
      client.messages.create(clientParams)
      // @ts-ignore
      .then((message: MessageInstance) => resolve(this.toSmsResponse(message)))
      .catch(reject);
    });
  }

  processWebhook (data: any): Promise<IWebhookResponse> {
    return  new Promise((resolve, reject) => {
      const webHookData = data as WebhookData;

      return webHookData ? resolve({
        id: webHookData.MessageSid,
        status: webHookData.MessageStatus,
        identifierSystem: this.identifierSystem
      } as IWebhookResponse) : reject(new Error('Invalid twilio webhook data'));
    });
  }

  private getMessageStatus (status: string) {
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
  }

  private toSmsResponse (message: any) : INotificationResponse {
    return {
      id: message.sid,
      sent: message.dateCreated,
      status: this.getMessageStatus(message.status),
      identifierSystem: this.identifierSystem
    };
  }
}
