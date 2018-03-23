/* eslint import/no-extraneous-dependencies: "off" */
import Vue from 'vue';
import MyComponent from '../../../component-library/dist/vue/components/test-component';

const NestedNestedComponent = {
  render(h) {
    return h('span', null, ['Nested nested text']);
  },
};
const NestedComponent1 = {
  render(h) {
    return h('p', { class: 'nested-component' }, ['Nested component 1']);
  },
};
const NestedComponent2 = {
  render(h) {
    return h('p', { class: 'nested-component' }, [
      'Nested component 2',
      h(NestedNestedComponent),
    ]);
  },
};

const App = {
  render(h) {
    return h(MyComponent, {
      class: 'extra-class',
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
      h(NestedComponent1),
      h(NestedComponent2),
    ]);
  },
};

const app = new Vue({
  el: '#app-vue',
  render: h => h(App),
});

export default app;
