'use strict';
import { default as config } from 'nconf';
import path from 'path';

config.argv().env();
const environnment = config.get('NODE_ENV') || 'development';

config.file('environment', path.resolve('../config', `${environnment}.json`));
config.file('default', path.resolve('../config', 'default.json'));

export default Object.assign({}, { get: (key: string) : any => config.get(key) });
