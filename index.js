import {run} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {restart, restartable} from 'cycle-restart';
import {makeKeysDriver} from 'cycle-keys';
import isolate from '@cycle/isolate';

import preventDefaultDriver from './src/drivers/prevent-default-driver';

var app = require('./src/app').default;

const drivers = {
  DOM: restartable(makeDOMDriver('.app'), {pauseSinksWhileReplaying: false}),
  Keys: restartable(makeKeysDriver()),
  preventDefault: preventDefaultDriver
};

const {sinks, sources} = run(app, drivers);

if (module.hot) {
  module.hot.accept('./src/app', () => {
    app = require('./src/app').default;

    restart(app, drivers, {sinks, sources}, isolate);
  });
}
