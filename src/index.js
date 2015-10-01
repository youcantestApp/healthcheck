'use strict';

import fs from 'fs';
import * as _ from 'lodash';
import HealthCheck from './healthcheck';
import { argv } from 'yargs';

let loadJSON = (name) => {
  let content = {};

  try {
    content = fs.readFileSync(name);
    content = JSON.parse(content);
  }
  catch (err) {
    console.log(`loading default configuration for filename ${name}`);
  }

  return content;
}

let defaultConfig = loadJSON('config/all.json');
let envConfig = {};
if(process.env.NODE_ENV === 'production') {
  envConfig = loadJSON(`config/production.json`);
}
else {
  envConfig = loadJSON(`config/development.json`);
}

let period = argv.p.trim() || 7;
try {
  period = parseInt(period);
}catch(err) {
  period = 7;
}

let config = _.extend({}, defaultConfig, envConfig, {period : period});

let hcheck = new HealthCheck(config);

console.log(`starting healthcheck for period=${period} at ${new Date().toString()}`);
hcheck.execute();
