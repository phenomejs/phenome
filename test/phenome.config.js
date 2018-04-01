module.exports = {
  paths: ['./component-library/src/**/*.js'],
  vue: {
    out: './component-library/dist/vue/',
  },
  react: {
    out: './component-library/dist/react/',
  },
  babelConfig: {
    plugins: ['@babel/plugin-proposal-object-rest-spread'],
  },
};
