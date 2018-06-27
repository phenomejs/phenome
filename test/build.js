const phenome = require('../lib/compiler-io/');

const build = async () => {
  try {
    await phenome();
  } catch (err) {
    console.error(err);
  }
};

build();
