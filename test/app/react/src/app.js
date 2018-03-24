/* eslint import/no-extraneous-dependencies: "off" */
import React from 'react';
import ReactDOM from 'react-dom';
import Framework7 from 'framework7/dist/framework7.esm.bundle';

import App from './app-component';

ReactDOM.render(
  React.createElement(App),
  document.getElementById('app'),
);

const app = new Framework7({
  root: '#app',
});

export default app;