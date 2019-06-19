import config from '../../src/config';
import { default as request } from 'supertest';
import { validCommunicationRequest } from '../testUtils/data';
import app from '../../src/app';
import { default as FhirStore } from '../../src/fhirstore';
import * as Channels from '../../src/channels';
import { createOperationOutcome } from '../testUtils';

jest.mock('../../src/config');
jest.mock('../../src/fhirstore');
jest.mock('../../src/channels');

describe('CommunicationRequest API', () => {
  describe('Integration tests', () => {
    const agent = request.agent(app);

    const setupSuccessfulRequest = () => {
      // @ts-ignore
      config.get = jest.fn().mockImplementation(() => 'test');
      // @ts-ignore
      FhirStore.addCommunicationRequest = jest.fn().mockImplementation(() =>
        Promise.resolve({
          communicationRequestReference: '',
          contactNumbers: [],
          text: 'A Text Message'
        }));

      // @ts-ignore
      FhirStore.addCommunicationResource = jest.fn()
        .mockImplementation(() => Promise.resolve({}));

      // @ts-ignore
      Channels.processCommunicationRequest = jest.fn()
        .mockImplementation(() => Promise.resolve([{}, { channel: 'sms', service: 'twilio' }]));
    };

    const setupInternalServerRequest = () => {
      // @ts-ignore
      config.get = jest.fn().mockImplementation(() => 'test');
      // @ts-ignore
      FhirStore.addCommunicationRequest = jest.fn().mockImplementation(() =>
        Promise.reject(new Error('Connection refused')));

      // @ts-ignore
      FhirStore.addCommunicationResource = jest.fn()
        .mockImplementation(() => Promise.resolve({}));
    };

    describe('POST', () => {
      test('should return status 202 given a successful request', async () => {
        const body = Object.assign({}, validCommunicationRequest);
        setupSuccessfulRequest();
        const expectedResponse = createOperationOutcome(
          'informational',
          'information',
          'Accepted'
        );

        const response = await agent.post('/CommunicationRequest').send(body);

        expect(response).toBeDefined();
        expect(response.status).toBe(202);
        expect(response.body).toEqual(expectedResponse);
      });

      test('should return status 400 given invalid resource type', async () => {
        const body = Object.assign({}, validCommunicationRequest);
        // @ts-ignore
        body.resourceType = 'Not a CommunicationRequest';
        setupSuccessfulRequest();
        const expectedResponse = createOperationOutcome(
          'invalid',
          'error',
          '"resourceType" must be one of [CommunicationRequest]'
        );

        const result = await agent.post('/Communicationrequest').send(body);

        expect(result).toBeDefined();
        expect(result.status).toBe(400);
        expect(result.body).toEqual(expectedResponse);
      });

      test('should return status 500 given an internal server error', async () => {
        const body = Object.assign({}, validCommunicationRequest);
        setupInternalServerRequest();
        const expectedResponse = createOperationOutcome(
          'exception',
          'fatal',
          'Connection refused'
        );

        const result = await agent.post('/CommunicationRequest').send(body);

        expect(result).toBeDefined();
        expect(result.status).toBe(500);
        expect(result.body).toEqual(expectedResponse);
      });
    });
  });
});
