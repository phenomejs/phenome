function replaceEnvironmentVars(componentString, config) {
  const { env, compiler, replace } = config;
  let string = componentString;

  if (typeof env === 'string') {
    string = string.replace(/process.env.NODE_ENV/g, JSON.stringify(env));
  } else {
    Object.keys(env).forEach((key) => {
      const re = new RegExp(`process.env.${key}`, 'g');
      string = string.replace(re, JSON.stringify(env[key]));
    });
  }
  if (replace) {
    Object.keys(replace).forEach((key) => {
      const re = new RegExp(key, 'g');
      string = string.replace(re, replace[key]);
    });
  }

  string = string.replace(/process.env.COMPILER/g, JSON.stringify(compiler));

  return string;
}
module.exports = replaceEnvironmentVars;
