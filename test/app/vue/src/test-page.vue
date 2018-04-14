<template>
  <f7-page :disabled="hasNavRight" :pageContent="false">
    <f7-navbar backLink="Go back" title="Test Page" @click:back="onBackClick">
      <f7-nav-right v-if="hasNavRight">Right</f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar labels v-if="hasNavRight">
      <f7-link icon="icon-back" text="Tab link 1" tabLink tabLinkActive></f7-link>
      <f7-link icon="icon-back" text="Tab link 2" tabLink="#tab2"></f7-link>
    </f7-toolbar>
    <f7-block strong>Hello</f7-block>
    <p>Button</p>
    <p>
      <f7-link>Hello</f7-link>
      <f7-link icon="icon-back"></f7-link>
      <f7-link href="/test2/">Test page 2</f7-link>
      <f7-link @click="toggleNavRight">Hello</f7-link>
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
    toggleNavRight() {
      console.log('toggle');
      this.$set(this, 'hasNavRight', !this.hasNavRight);
    },
    onPriceChange(values) {
      console.log(values);
      this.priceMin = values[0];
      this.priceMax = values[1];
    },
  },
};
</script>
