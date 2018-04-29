<template>
  <f7-page>
    <f7-navbar backLink="Go back" title="Test Page" @click:back="onBackClick">
      <f7-nav-right>Right</f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar labels>
      <f7-link icon="icon-back" text="Tab link 1" tabLink tabLinkActive></f7-link>
      <f7-link icon="icon-back" text="Tab link 2" tabLink="#tab2"></f7-link>
    </f7-toolbar>
    <f7-block>
      <f7-swiper navigation pagination scrollbar :style="{height: '300px'}" :params="{spaceBetween: 50}">
        <f7-swiper-slide>Slide 1</f7-swiper-slide>
        <f7-swiper-slide>Slide 2</f7-swiper-slide>
      </f7-swiper>
    </f7-block>
    <p>
      <f7-link href="/test2/">Test page 2</f7-link>
    </p>
    <f7-block>
      <p>
        <f7-toggle checked></f7-toggle>
      </p>
      <p>
        <f7-toggle checked color="blue"></f7-toggle>
      </p>
      <p>
        <f7-toggle checked disabled></f7-toggle>
      </p>
      <p>
        <f7-range
          :min="0"
          :max="100"
          :step="1"
          :value="10"
        ></f7-range>
      </p>
      <p>
        <f7-range
          :min="0"
          :max="100"
          :step="1"
          :value="50"
          :label="true"
          color="orange"
        ></f7-range>
      </p>
      <p>
        <f7-range
          :min="0"
          :max="500"
          :step="1"
          :value="[priceMin, priceMax]"
          :label="true"
          :dual="true"
          color="green"
          @range:change="onPriceChange"
        ></f7-range>
      </p>
    </f7-block>
    <f7-block>
      <f7-link href="/" routeTabId="tab1">Tab 1</f7-link>
      <f7-link href="/tab2/" routeTabId="tab2">Tab 2</f7-link>
      <f7-link href="/tab3/" routeTabId="tab3">Tab 3</f7-link>
    </f7-block>
    <f7-block>
      <f7-tabs routable>
        <f7-tab id="tab1" tabActive></f7-tab>
        <f7-tab id="tab2"></f7-tab>
        <f7-tab id="tab3"></f7-tab>
      </f7-tabs>
    </f7-block>
    <f7-list>
      <f7-list-item title="Item 1"></f7-list-item>
      <f7-list-item link="http://google.com" external target="_blank" title="Item 2"></f7-list-item>
      <f7-list-item after="CEO" title="Item 3"></f7-list-item>
      <f7-list-item badge="3" badgeColor="red" title="Item 4"></f7-list-item>
    </f7-list>
  </f7-page>
</template>
<script>
import f7Page from '../../../component-library/dist/vue/page';
import f7Block from '../../../component-library/dist/vue/block';
import f7Fab from '../../../component-library/dist/vue/fab';
import f7Link from '../../../component-library/dist/vue/link';
import f7Navbar from '../../../component-library/dist/vue/navbar';
import f7NavRight from '../../../component-library/dist/vue/nav-right';
import f7Toolbar from '../../../component-library/dist/vue/toolbar';
import f7Toggle from '../../../component-library/dist/vue/toggle';
import f7Range from '../../../component-library/dist/vue/range';
import f7Tabs from '../../../component-library/dist/vue/tabs';
import f7Tab from '../../../component-library/dist/vue/tab';
import f7Swiper from '../../../component-library/dist/vue/swiper';
import f7SwiperSlide from '../../../component-library/dist/vue/swiper-slide';
import f7List from '../../../component-library/dist/vue/list';
import f7ListItem from '../../../component-library/dist/vue/list-item';

export default {
  components: {
    f7Page,
    f7Block,
    f7Fab,
    f7Link,
    f7Navbar,
    f7NavRight,
    f7Toolbar,
    f7Toggle,
    f7Range,
    f7Swiper,
    f7SwiperSlide,
    f7Tabs,
    f7Tab,
    f7List,
    f7ListItem,
  },
  data() {
    return {
      hasNavRight: false,
      priceMin: 200,
      priceMax: 400,
    };
  },
  methods: {
    onBackClick() {
      console.log('onbackclick');
    },
    onPriceChange(values) {
      console.log(values);
      this.priceMin = values[0];
      this.priceMax = values[1];
    },
  },
};
</script>
