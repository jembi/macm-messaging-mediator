'use strict';
import express from 'express';
import { addCommunicationRequest, getCommunicationRequests } from './api.handlers';
import { wrapHandler } from '../utils';

const router = express.Router();

router.route('/')
  .post(wrapHandler(addCommunicationRequest))
  .get(wrapHandler(getCommunicationRequests));

export default {
  apiRouter: router
};
