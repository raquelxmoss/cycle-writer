import {run} from '@cycle/xstream-run';
import {makeDOMDriver} from '@cycle/dom';
import {makeKeysDriver} from 'cycle-keys';

import preventDefaultDriver from './src/drivers/prevent-default-driver';

import app from './src/app';

const drivers = {
  DOM: makeDOMDriver('.app'),
  Keys: makeKeysDriver(),
  preventDefault: preventDefaultDriver
};

run(app, drivers);
