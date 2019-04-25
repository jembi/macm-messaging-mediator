'use strict'
import express from 'express'
import { addCommunicationRequest } from './api.handlers'
import { wrapHandler } from '../utils'

const router = express.Router()

router.post('/', wrapHandler(addCommunicationRequest))

export default {
  apiRouter: router
}
