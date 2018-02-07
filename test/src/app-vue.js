/* eslint import/no-extraneous-dependencies: "off" */
import Vue from 'vue';
import MyComponent from './test-component.vue';

const app = new Vue({
  el: '#app-vue',
  render: h => h(MyComponent, {
    props: {
      name: 'Ben',
      compiler: 'Vue.js',
      countFrom: 10,
    },
    on: {
      click(e) {
        console.log('Vue click', e.target);
      },
    },
  }),
});

export default app;
