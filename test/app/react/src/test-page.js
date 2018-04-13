import React from 'react';
import F7Page from '../../../component-library/dist/react/page';
import F7Block from '../../../component-library/dist/react/block';
import F7Fab from '../../../component-library/dist/react/fab';

export default class TestPage extends React.Component {
  render() {
    return (
      <F7Page>
        <F7Fab>Hello</F7Fab>
        <div className="navbar">Test Page</div>
        <F7Block strong>Hello</F7Block>
        <p>Button</p>
      </F7Page>
    );
  }
};
