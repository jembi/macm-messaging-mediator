'use strict';
import express, { Request, Response } from 'express';
import { wrapHandler } from './utils';
import { processStatusRequestById, processStatusRequest } from './channels';

const router = express.Router();

router.get('/:channel/:service/:resource/:id', wrapHandler(async (req: Request, res: Response) =>
  res.status(200).json(await processStatusRequestById({
    resource: req.params.resource,
    id: req.params.id,
    searchParams: req.query,
    channel: req.params.channel,
    serviceName: req.params.service
  }))
));

router.get('/:channel/:service/:resource', wrapHandler(async (req: Request, res: Response) =>
  res.status(200).json(await processStatusRequest({
    resource: req.params.resource,
    searchParams: req.query,
    channel: req.params.channel,
    serviceName: req.params.service
  }))
));

export default router;
