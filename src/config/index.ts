'use strict';
import { PortNumber } from '../utils';

interface IConfig {
  [index: string]: string | number | boolean;
  hearthHost: string;
  hearthPort: PortNumber;
  hearthSecured: boolean;
  env: string;
  port: PortNumber;
}

const config: IConfig = {
  hearthHost: process.env.HEARTH_HOST || 'localhost',
  hearthPort: process.env.HEARTH_PORT || '3447',
  hearthSecured: Boolean(process.env.HEARTH_SCURED) || false,
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000
};

export default {
  get: (key: string) => config[key]
};
