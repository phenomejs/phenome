import React from 'react';
import F7Page from '../../../component-library/dist/react/page';
import F7Navbar from '../../../component-library/dist/react/navbar';
import F7NavRight from '../../../component-library/dist/react/nav-right';
import F7Block from '../../../component-library/dist/react/block';
import F7Link from '../../../component-library/dist/react/link';
import F7Toolbar from '../../../component-library/dist/react/toolbar';
import F7Toggle from '../../../component-library/dist/react/toggle';
import F7Range from '../../../component-library/dist/react/range';
import F7Swiper from '../../../component-library/dist/react/swiper';
import F7SwiperSlide from '../../../component-library/dist/react/swiper-slide';
import F7Tabs from '../../../component-library/dist/react/tabs';
import F7Tab from '../../../component-library/dist/react/tab';

export default class TestPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      priceMin: 200,
      priceMax: 400,
    }
  }
  render() {
    return (
      <F7Page>
        <F7Navbar backLink="Go back" title="Test Page" onBackClick={this.onBackClick.bind(this)}>
          <F7NavRight>Right</F7NavRight>
        </F7Navbar>
        <F7Toolbar tabbar labels>
          <F7Link icon="icon-back" text="Tab link 1" tabLink tabLinkActive></F7Link>
          <F7Link icon="icon-back" text="Tab link 2" tabLink="#tab2"></F7Link>
        </F7Toolbar>
        <F7Block>
          <F7Swiper navigation pagination scrollbar style={{height: '300px'}} params={{spaceBetween: 50}}>
            <F7SwiperSlide>Slide 1</F7SwiperSlide>
            <F7SwiperSlide>Slide 2</F7SwiperSlide>
          </F7Swiper>
        </F7Block>
        <p>
          <F7Link href="/test2/">Test page 2</F7Link>
        </p>
        <F7Block>
          <p>
            <F7Toggle checked></F7Toggle>
          </p>
          <p>
            <F7Toggle checked color="red"></F7Toggle>
          </p>
          <p>
            <F7Toggle checked disabled></F7Toggle>
          </p>
          <div>
            <F7Range
              min={0}
              max={100}
              step={1}
              value={10}
            ></F7Range>
          </div>
          <div>
            <F7Range
              min={0}
              max={100}
              step={1}
              value={50}
              label={true}
              color="orange"
            ></F7Range>
          </div>
          <div>
            <F7Range
              min={0}
              max={500}
              step={1}
              value={[this.state.priceMin, this.state.priceMax]}
              label={true}
              dual={true}
              color="green"
              onRangeChange={this.onPriceChange.bind(this)}
            ></F7Range>
          </div>
        </F7Block>
        <F7Block>
          <F7Link href="/" routeTabId="tab1">Tab 1</F7Link>
          <F7Link href="/tab2/" routeTabId="tab2">Tab 2</F7Link>
          <F7Link href="/tab3/" routeTabId="tab3">Tab 3</F7Link>
        </F7Block>
        <F7Block>
          <F7Tabs routable>
            <F7Tab id="tab1" tabActive></F7Tab>
            <F7Tab id="tab2"></F7Tab>
            <F7Tab id="tab3"></F7Tab>
          </F7Tabs>
        </F7Block>
      </F7Page>
    );
  }
  onBackClick() {
    console.log('back click')
  }
  toggleNavRight() {
    console.log('toggle');
    this.setState({
      hasNavRight: !this.state.hasNavRight,
    });
  }
  onPriceChange(values) {
    console.log(values);
    this.setState({priceMin: values[0]});
    this.setState({priceMax: values[1]});
  }
};
