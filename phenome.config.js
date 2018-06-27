module.exports = {
  paths: ['./test/src/**/*.js', './test/src/**/*.jsx'],
  react: {
    out: './test/dist/react/',
    helpers: {
      el: 'auto',
      slots: 'auto',
      props: 'auto',
      children: 'auto',
      parent: 'auto',
      refs: 'auto',
      dispatchEvent: 'auto',
      watch: 'auto',
      forceUpdate: 'auto',
    },
  },
  vue: {
    out: './test/dist/vue/',
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
