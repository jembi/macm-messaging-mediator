/* eslint-disable indent */
'use strict'
import { COMMUNICATION_REQUEST, COMMUNICATION_REQUEST_ACTIVE_STATUS } from './contants'
import { bindCommunicationRequest } from './middlewares'

describe('Middlewares', () => {
  describe('bindCommunicationRequest', () => {
    describe('request body alidations', () => {
      test(`binds to request object when resourceType is ${COMMUNICATION_REQUEST} and valid`, () => {
        const request = {
          body: {
            resourceType: 'CommunicationRequest',
            status: 'active'
          }
        }
        const next = jest.fn()

        bindCommunicationRequest(request, {}, next)

        expect(next.mock.calls.length).toBe(1)
        expect(next.mock.calls[0][0]).toBeUndefined()
        expect(request.communicationRequest).toBeDefined()
        expect(request.communicationRequest.resourceType).toBe('CommunicationRequest')
        expect(request.communicationRequest.status).toBe('active')
      })

      test('raises error when request body is empty or undefined', () => {
        const request = { body: undefined }
        const next = jest.fn()

        bindCommunicationRequest(request, {}, next)

        expect(next.mock.calls.length).toBe(1)
        expect(next.mock.calls[0].length).toBe(1)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
        expect(next.mock.calls[0][0].message).toBe('"resourceType" is required')
        expect(request.communicationRequest).toBeUndefined()
      })
    })

    describe('resourceType validations', () => {
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

    describe('validate status', () => {
      test(`raises error when 'status' is not found`, () => {
        const request = { body: { resourceType: 'CommunicationRequest' } }
        const next = jest.fn()

        bindCommunicationRequest(request, {}, next)

        expect(next.mock.calls.length).toBe(1)
        expect(next.mock.calls[0].length).toBe(1)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
        expect(next.mock.calls[0][0].message).toBe(`Resource status is required and must be 'active'`)
        expect(request.communicationRequest).toBeUndefined()
      })

      test.each`
        status
        ${''}
        ${undefined}
        ${'undefined'}
        ${'not a valid status'}
        `(`raises error when 'status' is not '${COMMUNICATION_REQUEST_ACTIVE_STATUS}'`, ({ status }) => {
        const request = { body: { resourceType: COMMUNICATION_REQUEST, status: status } }
        const next = jest.fn()

        bindCommunicationRequest(request, {}, next)

        expect(next.mock.calls.length).toBe(1)
        expect(next.mock.calls[0].length).toBe(1)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
        console.log(next.mock.calls[0][0].message)
        expect(next.mock.calls[0][0].message).toBe(`Resource status is required and must be 'active'`)
        expect(request.communicationRequest).toBeUndefined()
      })
    })
  })
})
