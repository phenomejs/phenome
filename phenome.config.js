module.exports = {
  paths: ['./test/component-library/src/**/*.js', './test/component-library/src/**/*.jsx'],
  react: {
    out: './test/component-library/dist/react/',
    helpers: {
      el: 'auto',
      slots: 'auto',
      props: 'auto',
      children: 'auto',
      parent: 'auto',
      dispatchEvent: 'auto',
      watch: 'auto',
      forceUpdate: 'auto',
    },
  },
  vue: {
    out: './test/component-library/dist/vue/',
    helpers: {
      el: 'auto',
      slots: 'auto',
      props: 'auto',
      children: 'auto',
      parent: 'auto',
      refs: 'auto',
      dispatchEvent: 'auto',
      state: 'auto',
      setState: 'auto',
      forceUpdate: 'auto',
    },
  },
};
