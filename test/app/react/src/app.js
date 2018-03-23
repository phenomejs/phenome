/* eslint import/no-extraneous-dependencies: "off" */
import React from 'react';
import ReactDOM from 'react-dom';
import MyComponent from '../../../component-library/dist/react/components/test-component';

class NestedNestedComponent extends React.Component {
  render() {
    return React.createElement('span', null, ['Nested nested text']);
  }
}
class NestedComponent1 extends React.Component {
  render() {
    return React.createElement('p', { className: 'nested-component' }, ['Nested component 1']);
  }
}
class NestedComponent2 extends React.Component {
  render() {
    return React.createElement('p', { className: 'nested-component' }, [
      'Nested component 2',
      React.createElement(NestedNestedComponent),
    ]);
  }
}
class App extends React.Component {
  render() {
    return React.createElement(MyComponent, {
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
      React.createElement(NestedComponent1),
      React.createElement(NestedComponent2),
    ]);
  }
}

ReactDOM.render(
  React.createElement(App),
  document.getElementById('app-react'),
);
