'use strict'
import { COMMUNICATION_REQUEST } from './contants'
import { bindCommunicationRequest } from './middlewares'

describe('Middlewares', () => {
  describe('bindCommunicationRequest', () => {
    test(`binds to request object when resourceType is ${COMMUNICATION_REQUEST}`, () => {
      const request = { body: { resourceType: 'CommunicationRequest' } }
      const next = jest.fn()

      bindCommunicationRequest(request, {}, next)

      expect(next.mock.calls.length).toBe(1)
      expect(next.mock.calls[0][0]).toBeUndefined()
      expect(request.communicationRequest).toBeDefined()
      expect(request.communicationRequest.resourceType).toBe('CommunicationRequest')
    })

    test(`raises error when request body is empty or undefined`, () => {
      const request = { body: undefined }
      const next = jest.fn()

      bindCommunicationRequest(request, {}, next)

      expect(next.mock.calls.length).toBe(1)
      expect(next.mock.calls[0].length).toBe(1)
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(next.mock.calls[0][0].message).toBe('"resourceType" is required')
      expect(request.communicationRequest).toBeUndefined()
    })

    test(`raises error when 'resourceType' is not found`, () => {
      const request = { body: { status: 'active' } }
      const next = jest.fn()

      bindCommunicationRequest(request, {}, next)

      expect(next.mock.calls.length).toBe(1)
      expect(next.mock.calls[0].length).toBe(1)
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(next.mock.calls[0][0].message).toBe('"resourceType" is required')
      expect(request.communicationRequest).toBeUndefined()
    })

    test(`raises error when 'resourceType' is not '${COMMUNICATION_REQUEST}'`, () => {
      const request = { body: { resourceType: 'not communication request', status: 'active' } }
      const next = jest.fn()

      bindCommunicationRequest(request, {}, next)

      expect(next.mock.calls.length).toBe(1)
      expect(next.mock.calls[0].length).toBe(1)
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(next.mock.calls[0][0].message).toBe('"resourceType" must be one of [CommunicationRequest]')
      expect(request.communicationRequest).toBeUndefined()
    })
  })
})
