import React from 'react';
import Framework7 from 'framework7/dist/framework7.esm.bundle';

import F7App from '../../../component-library/dist/react/app';
import F7View from '../../../component-library/dist/react/view';

import TestPage from './test-page.js';

const routes = [
  {
    path: '/',
    component: TestPage,
  },
  {
    path: '/test2/',
    component: TestPage,
  },
  {
    path: '/test3/',
    component: TestPage,
  }
];

class App extends React.Component {
  render() {
    return (
      <F7App framework7={Framework7} react={React} routes={routes}>
        <F7View main={true} color="red" url="/" onSwipeBackMove={this.onSwipeBackMove.bind(this)}></F7View>
      </F7App>
    );
  }
  onSwipeBackMove(e) {
    console.log(this, e);
  }
}
export default App;
