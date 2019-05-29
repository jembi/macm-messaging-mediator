import { getRecipientContactNumbers } from './fhirstore.service';
import { validCommunicationRequest } from '../testUtils/data';
import { CommunicationRequest } from '../communication_request/types';

describe('FHIR Store service', () => {
  describe('getRecipientContactNumbers()', () => {
    // @ts-ignore
    let resource : CommunicationRequest = {};

    beforeEach(() => {
      resource = Object.assign({}, validCommunicationRequest);
    });

    test.skip('should return contact numbers given matching recipients with contact numbers', () => {

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
});
