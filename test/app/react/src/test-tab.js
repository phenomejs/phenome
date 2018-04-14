import React from 'react';

export default class TestTab extends React.Component {
  render() {
    return (
      <div>
        <p>This is tab content loaded by router</p>
        <p>Tab route is:</p>
        <p>{JSON.stringify(this.$f7route)}</p>
      </div>
    );
  }
};
