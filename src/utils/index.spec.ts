import { createOperationOutcome, getSeverityAndCode } from '.';
import { OperationOutcomeIssue } from './types';

describe('Utils', () => {
  describe('createOperationOutcome()', () => {
    test.each`
      severity         | code               | text
      ${'information'} | ${'informational'} | ${'Created!'}
      ${'error'}       | ${'invalid'}       | ${'"CommunicationRequests" is not a valid FHIR resource!'}
    `('should return OperationOutcome resource given valid arguments',
      ({ severity, code, text }) => {
        const operationOutComeIssues: OperationOutcomeIssue[] = [{ severity, code, text }];

        const result = createOperationOutcome(operationOutComeIssues);

        expect(result).toBeDefined();
        expect(result.resourceType).toBe('OperationOutcome');
        expect(result.issues.length).toBe(1);
        expect(result.issues[0].code).toBe(code);
        expect(result.issues[0].severity).toBe(severity);
        expect(result.issues[0].text).toBe(text);
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
    })
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
});
