/* eslint import/no-extraneous-dependencies: "off" */
import React from 'react';
import ReactDOM from 'react-dom';
import MyComponent from './test-component.react';

ReactDOM.render(
  React.createElement(MyComponent, {
    name: 'Ben',
    className: 'extra-class',
    countFrom: 10,
    compiler: 'React',
    onClick(e) {
      console.log('React click', e.target);
    },
  }),
  document.getElementById('app-react'),
);
