#!/usr/bin/env node
import app from './app';
import http from 'http';
import { logger } from './utils';
import config from './config';
import { configOptions } from './constants';

const normalizePort = (val: any) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
};

const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Pipe ${port}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe  ${addr}`
    : `port ${addr ? addr.port : config.get(configOptions.PORT)}`;
  logger.info(`Listening on ${bind}`);
};

const port = normalizePort(config.get('port'));
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
