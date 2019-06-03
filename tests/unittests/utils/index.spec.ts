import { createOperationOutcome, getSeverityAndCode, buildHearthUrl } from '../../../src/utils';
import { OperationOutcomeIssue, UrlArgs } from '../../../src/utils/types';

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
});
