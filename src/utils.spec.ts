import { createOperationOutcome, OperationOutcomeIssue } from './utils';

describe('Utils', () => {
  describe('createOperationOutcome()', () => {
    test.each`
      severity         | code               | text
      ${'information'} | ${'informational'} | ${'Created!'}
      ${'error'}       | ${'exception'}     | ${'Internal Server Error!'}
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
  });
});
