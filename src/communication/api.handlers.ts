'use strict';
import { Request, Response } from 'express';
import { logger } from '../utils';

export const communicationRapidProCallback = async (req: Request, res: Response, next: Function) => {
  logger.info(`From rapidPro with love: ${req.body}`);
  return res.status(201).send();
};
