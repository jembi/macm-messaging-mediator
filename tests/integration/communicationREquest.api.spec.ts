import { default as config } from 'nconf';
import { default as request } from 'supertest';
import { validCommunicationRequest } from '../testUtils/data';
import app from '../../src/app';
import * as services from '../../src/services';
import * as rapidProService from '../../src/channels/rapidpro';
import { createOperationOutcome } from '../testUtils';

jest.mock('nconf');
jest.mock('../../src/services');
jest.mock('../../src/channels/rapidpro');

describe('CommunicationRequest API', () => {
  describe('Integration tests', () => {
    const agent = request.agent(app);

    const setupSuccessfulRequest = () => {
      // @ts-ignore
      config.get = jest.fn().mockImplementation(() => 'test');
      // @ts-ignore
      services.fhirStore.addCommunicationRequest = jest.fn().mockImplementation(() =>
        Promise.resolve({
          communicationRequestReference: '',
          contactNumbers: [],
          text: 'A Text Message'
        }));

      // @ts-ignore
      services.fhirStore.addCommunicationResource = jest.fn().mockImplementation(() => Promise.resolve({}));

      // @ts-ignore
      rapidProService.send = jest.fn().mockImplementation(() => Promise.resolve({}));
    };

    const setupInternalServerRequest = () => {
      // @ts-ignore
      config.get = jest.fn().mockImplementation(() => 'test');
      // @ts-ignore
      services.fhirStore.addCommunicationRequest = jest.fn().mockImplementation(() =>
        Promise.reject(new Error('Connection refused')));

      // @ts-ignore
      services.fhirStore.addCommunicationResource = jest.fn().mockImplementation(() => Promise.resolve({}));

      // @ts-ignore
      rapidProService.send = jest.fn().mockImplementation(() => Promise.resolve({}));
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
