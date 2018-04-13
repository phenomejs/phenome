/* eslint import/no-extraneous-dependencies: "off" */
import Vue from 'vue';

import App from './app-component.vue';

const app = new Vue({
  el: '#app',
  render: h => h(App),
});

export default app;
