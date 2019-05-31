import { default as config } from 'nconf';
import { rapidProDataAdapter } from './api.handlers';
import { AddCommunicationRequestResponse } from './types';

jest.mock('nconf');

describe('CommunicationRequest API handler', () => {
  describe('rapidProDataAdapter()', () => {
    test('should throw Error when no "addCommunicationRequestResponse" arguments', () => {
      expect(() => { rapidProDataAdapter({} as AddCommunicationRequestResponse); })
        .toThrow('"addCommunicationRequestResponse" is required.');
    });

    test('should return RapidProFlowBody given valid add addCommunicationRequestResponse', () => {
      const addCommunicationRequestResponse : AddCommunicationRequestResponse = {
        communicationRequestReference: 'Communicationrequest/92168e4b-d291-42e8-a29b-fb6b63986a4e',
        text: 'Text Message',
        contactNumbers: ['tel:+27731234567', 'tel:+270821234567']
      };
      // @ts-ignore
      config.get.mockImplementation(() => '92168e4b-d291-42e8-a29b-fb6b63986a4e');

      const result = rapidProDataAdapter(addCommunicationRequestResponse);

      expect(result).toBeDefined();
      expect(result.flow).toBe('92168e4b-d291-42e8-a29b-fb6b63986a4e');
      expect(result.urns.length).toBe(2);
      expect(result.urns).toContain('tel:+27731234567');
      expect(result.urns).toContain('tel:+270821234567');
    });
  });
});
