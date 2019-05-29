import { getRecipientContactNumbers, getTextMessage } from './fhirstore.service';
import { validCommunicationRequest } from '../testUtils/data';
import { CommunicationRequest } from '../communication_request/types';

describe('FHIR Store service', () => {
  describe('getRecipientContactNumbers()', () => {
    // @ts-ignore
    let resource : CommunicationRequest = {};

    beforeEach(() => {
      resource = Object.assign({}, validCommunicationRequest);
    });

    test('should return contact numbers given matching recipients with contact numbers', () => {
      const expectedSystem = 'phone';
      const expectedValue = 'tel:+27731234567';
      // @ts-ignore
      resource.contained[0].telecom.system = expectedSystem;
      // @ts-ignore
      resource.contained[0].telecom.value = '+27731234567';

      const result = getRecipientContactNumbers(resource);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toBe(expectedValue);
    });

    test('should return an empty array given no contact numbers in resource', () => {
      delete resource.contained;

      // @ts-ignore
      const result = getRecipientContactNumbers({});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test('should return an empty array given no matching recipient', () => {
      resource.contained[0].id = 'contained'; // Change id to ensure no match

      const result = getRecipientContactNumbers(resource);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test("should return an empty array given no 'phone' telecom system", () => {
      // @ts-ignore
      resource.contained[0].telecom.system = 'email'; // Change telecom system to ensure no match

      const result = getRecipientContactNumbers(resource);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test('should return an empty array given no telecom system for recipient', () => {
      delete resource.contained[0].telecom; // Remove telecom system to ensure no match

      const result = getRecipientContactNumbers(resource);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getTextMessage()', () => {
    test('should return the correct text message given no errors', () => {
      const resource = Object.assign({}, validCommunicationRequest);
      const expectedTextMessage = 'Test message';
      resource.payload.contentString = expectedTextMessage;

      const result = getTextMessage(resource);

      expect(result).toBeDefined();
      expect(result).toBe(expectedTextMessage);
    });

    test('should return an empty string given no text message', () => {
      const resource = Object.assign({}, validCommunicationRequest);
      delete resource.payload.contentString;

      const result = getTextMessage(resource);

      expect(result).toBeDefined();
      expect(result).toBe('');
    });
  });
});
