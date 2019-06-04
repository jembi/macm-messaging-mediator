'use strict';
import { OperationOutcomeIssueCode, OperationOutcomeIssueSeverity } from "../../src/utils/types";

export const createOperationOutcome = (
  code: OperationOutcomeIssueCode,
  severity: OperationOutcomeIssueSeverity,
  text: string) => ({
    resourceType: 'OperationOutcome',
    issues: [{
      code: code,
      details: {
        text: text
      },
      severity: severity
    }]
  });
