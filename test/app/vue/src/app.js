/* eslint import/no-extraneous-dependencies: "off" */
import Vue from 'vue';
import Framework7 from 'framework7';
import Framework7Vue from 'framework7-vue/dist/framework7-vue.esm.bundle';

import App from './app-component.vue';

Vue.use(Framework7Vue, Framework7);

const app = new Vue({
  el: '#app',
  render: h => h(App),
  framework7: {},
});

export default app;
