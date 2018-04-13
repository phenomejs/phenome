/* eslint import/no-extraneous-dependencies: "off" */
import React from 'react';
import ReactDOM from 'react-dom';

import App from './app-component';

ReactDOM.render(
  React.createElement(App),
  document.getElementById('app'),
);