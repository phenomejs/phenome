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
  }, [
    React.createElement('span', { slot: 'before-button' }, ['Before button']),
    React.createElement('span', { slot: 'after-button' }, ['After button']),
    React.createElement('span', null, ['Default slot']),
  ]),
  document.getElementById('app-react'),
);
