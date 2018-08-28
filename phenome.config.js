module.exports = {
  paths: ['./test-component/src/**/*.js', './test-component/src/**/*.jsx'],
  react: {
    out: './test-component/dist/react/',
    typeScriptDefinitions: true,
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
    out: './test-component/dist/vue/',
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
