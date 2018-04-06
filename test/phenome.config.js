module.exports = {
  paths: ['./component-library/src/**/*.js'],
  react: {
    out: './component-library/dist/react/',
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
    out: './component-library/dist/vue/',
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
