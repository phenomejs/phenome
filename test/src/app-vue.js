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
  }, [
    h('span', { slot: 'before-button' }, ['Before button']),
    h('span', { slot: 'after-button' }, ['After button']),
    h('span', ['Default slot']),
  ]),
});

export default app;
