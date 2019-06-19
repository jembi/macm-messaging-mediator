'use strict';
import { default as config } from 'nconf';
import path from 'path';

const environnment = config.get('NODE_ENV') || 'development';
const configPath = path.join(path.resolve(__dirname, '../', 'config'), `${environnment}.json`);
config.argv().env().file('environment', configPath);

export default Object.assign({}, { get: (key: string) : any => config.get(key) });
