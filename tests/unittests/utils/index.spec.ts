import {
  createOperationOutcome,
  getSeverityAndCode,
  buildHearthUrl,
  createCallbackUrl,
  appendExpressSearchParams
} from '../../../src/utils';
import { OperationOutcomeIssue, UrlArgs } from '../../../src/utils/types';
import config from '../../../src/config';

jest.mock('../../../src/config');

describe('Utils', () => {
  describe('createOperationOutcome()', () => {
    test.each`
      severity         | code               | text
      ${'information'} | ${'informational'} | ${'Created!'}
      ${'error'}       | ${'invalid'}       | ${'"CommunicationRequests" is not a valid FHIR resource!'}
    `('should return OperationOutcome resource given valid arguments',
      ({ severity, code, text }) => {
        const operationOutComeIssues: OperationOutcomeIssue[] = [{ severity, code, details: { text } }];

        const result = createOperationOutcome(operationOutComeIssues);

        expect(result).toBeDefined();
        expect(result.resourceType).toBe('OperationOutcome');
        expect(result.issues.length).toBe(1);
        expect(result.issues[0].code).toBe(code);
        expect(result.issues[0].severity).toBe(severity);
        expect(result.issues[0].details.text).toBe(text);
      });

    test.each`
      statucCode
      ${505}
      ${301}
      ${203}
      ${401}
    `('should throw an error given an invalid status code', ({ statusCode }) => {
      const getSeverityAndCodeWrapper = () => getSeverityAndCode(statusCode);

      expect(getSeverityAndCodeWrapper).toThrowError('The provided status code is not supported');
    });
  });

  describe('getSeverityAndCode()', () => {
    test.each`
      statusCode  | expectedSeverity  | expectedCode
      ${500}      | ${'fatal'}        | ${'exception'}
      ${400}      | ${'error'}        | ${'invalid'}
      ${202}      | ${'information'}  | ${'informational'}
      ${404}      | ${'error'}        | ${'invalid'}
    `('should return correct combination given valid codes', ({
      statusCode, expectedSeverity, expectedCode }) => {
      const result = getSeverityAndCode(statusCode);

      expect(result).toBeDefined();
      expect(result.severity).toBe(expectedSeverity);
      expect(result.code).toBe(expectedCode);
    });
  });

  describe('buildHearthUrl()', () => {
    test.each`
     secured       | path        | port         | expectedUrl
     ${false}      | ${'/fhir'}  | ${3447}      | ${'http://localhost:3447/fhir'}
     ${true}       | ${'/fhir'}  | ${'3447'}    | ${'https://localhost:3447/fhir'}
     ${undefined}  | ${'/'}      | ${3447}      | ${'http://localhost:3447/'}
     ${false}      | ${'fhir'}   | ${3447}      | ${'http://localhost:3447/fhir'}
     ${false}      | ${'/fhir'}  | ${undefined} | ${'http://localhost/fhir'}
    `('should return correctly formatted url given valid args', ({ secured, path, port, expectedUrl }) => {
      const urlArgs : UrlArgs = {
        secured,
        path,
        port,
        host: 'localhost'
      };

      const result = buildHearthUrl(urlArgs);

      expect(result).toBeDefined();
      expect(result).toEqual(expectedUrl);
    });

    test('should throw Error given non-numeric port number', () => {
      const urlArgs : UrlArgs = {
        secured: false,
        path: '/fhir',
        port: 'port number',
        host: 'localhost'
      };

      expect(() => buildHearthUrl(urlArgs)).toThrowError('Port number must be numeric');
    });

    test.each`
      host
      ${null}
      ${undefined}
      ${['localhost']}
      ${{ host: 'localhost' }}
      ${() => 'localhost'}
      ${1234}
    `('should throw Error given "$host" for host', ({ host }) => {
      const urlArgs : UrlArgs = {
        host,
        port: 3447,
        path: '/fhir',
        secured: false
      };

      expect(() => buildHearthUrl(urlArgs)).toThrowError('Invalid host');
    });
  });

  describe('createCallbackUrl()', () => {
    test.each`
      port          | protocol    | expectedResult
      ${3000}       | ${'http'}   | ${'http://localhost:3000/webhook/sms/twilio'}
      ${undefined}  | ${'https'}  | ${'https://localhost/webhook/sms/twilio'}
      ${''}         | ${'http'}   | ${'http://localhost/webhook/sms/twilio'}
    `('should return webhook url given valid config', ({ port, protocol, expectedResult }) => {
      config.get = jest.fn().mockImplementationOnce(() => ({
        webhook: {
          port,
          protocol,
          host: 'localhost'
        }
      }));

      const result = expect(createCallbackUrl('sms', 'twilio')).toEqual(expectedResult);
    });

    test.each`
      channel
      ${undefined}
      ${null}
      ${''}
    `('should throw error when no channel is defined', ({ channel }) => {
      expect(() => createCallbackUrl(channel, 'twilio'))
        .toThrowError('Channel is required for creating a callback url');
    });

    test.each`
      service
      ${undefined}
      ${null}
      ${''}
    `('should throw error when no service is defined', ({ service }) => {
      expect(() => createCallbackUrl('sms', service))
      .toThrowError('Service is required for creating a callback url');
    });

    test('should throw error when no webhook config defined', () => {

      config.get = jest.fn().mockImplementationOnce(() => ({ webhook: undefined }));

      expect(() => createCallbackUrl('sms', 'twilio'))
        .toThrowError('Webhook configuration missing');
    });

    test('should throw error when no webhook host defined', () => {

      config.get = jest.fn().mockImplementationOnce(() => ({
        webhook: {
          port: 3000,
          protocol: 'http'
        }
      }));

      expect(() => createCallbackUrl('sms', 'twilio'))
        .toThrowError('Webhook host is required');
    });

    test.each`
      protocol
      ${undefined}
      ${''}
      ${{}}
      ${[]}
      ${'invalid string'}
    `('should throw error when protocol is "$protocol"', ({ protocol }) => {
      config.get = jest.fn().mockImplementationOnce(() => ({
        webhook: {
          protocol,
          host: 'localhost',
          port: 3000
        }
      }));

      expect(() => createCallbackUrl('sms', 'twilio'))
        .toThrowError('Webhook protocol is required and must be "http" or "https"');
    });
  });

  describe('appendExpressQueryStrings()', () => {
    test.each([
      [
        { count: 100 },
        'http://127.0.0.1/fhir/communicationrequest',
        'http://127.0.0.1/fhir/communicationrequest?count=100'
      ],
      [
        { count: 100, status: 'active' },
        'http://127.0.0.1/fhir/communicationrequest/',
        'http://127.0.0.1/fhir/communicationrequest/?count=100&status=active'
      ]
    // @ts-ignore
    ])('should return correct url with search parameters', (queryStrings, url, expectedResult) => {
      const result = appendExpressSearchParams(url, queryStrings);

      expect(result).toBe(expectedResult);
    });

    test.each`
      searchParams                        | url
      ${{ count: 100, status: 'active' }} | ${''}
      ${{ count: 100, status: 'active' }} | ${undefined}
      ${{ count: 100, status: 'active' }} | ${null}
    `('should throw error when no url is given', ({ searchParams, url }) => {
      expect(() => appendExpressSearchParams(url, searchParams))
        .toThrowError('Invalid url');
    });
  });
});
