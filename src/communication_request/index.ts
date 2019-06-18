'use strict';
import express from 'express';
import {
  addCommunicationRequest,
  getCommunicationRequests,
  getCommunicationRequestById } from './api.handlers';
import { wrapHandler } from '../utils';

const router = express.Router();

router.route('/')
  .post(wrapHandler(addCommunicationRequest))
  .get(wrapHandler(getCommunicationRequests));

router.route('/:id')
  .get(wrapHandler(getCommunicationRequestById));

export default {
  apiRouter: router
};
