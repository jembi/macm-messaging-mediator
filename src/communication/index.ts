'use strict';
import express from 'express';
import cors from 'cors';
import { communicationRapidProCallback } from './api.handlers';
import { wrapHandler } from '../utils';

const router = express.Router();
router.post('/', cors(), wrapHandler(communicationRapidProCallback));

export default {
  apiRouter: router
};
