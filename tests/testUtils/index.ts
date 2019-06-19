'use strict';
import { OperationOutcomeIssueCode, OperationOutcomeIssueSeverity } from '../../src/types';

export const createOperationOutcome = (
  code: OperationOutcomeIssueCode,
  severity: OperationOutcomeIssueSeverity,
  text: string) => ({
    resourceType: 'OperationOutcome',
    issues: [{
      severity,
      code,
      details: {
        text
      }
    }]
  });
