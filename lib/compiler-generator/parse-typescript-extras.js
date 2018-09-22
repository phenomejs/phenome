function parseTypescripExtras(componentString, config) {
  const { compiler } = config;
  const extras = {
    imports: [],
    props: [],
    instance: [],
  };

  const regExps = [
    new RegExp('/*[ ]*?phenome-dts-([a-z]*)([^\\*]*)\\*/', 'g'),
    new RegExp('//[ ]*?phenome-dts-([a-z]*)([^\\n]*)', 'g'),
    new RegExp(`/*[ ]*?phenome-${compiler}-dts-([a-z]*)([^\\*]*)\\*/`, 'g'),
    new RegExp(`//[ ]*?phenome-${compiler}-dts-([a-z]*)([^\\n]*)`, 'g'),
  ];
  regExps.forEach((re) => {
    let result;
    // eslint-disable-next-line
    while (result = re.exec(componentString)) {
      let type = result[1];
      const data = result[2];
      if (type === 'import') type = 'imports';
      if (type === 'prop') type = 'props';
      extras[type].push(data.trim());
    }
  });

  return extras;
}
module.exports = parseTypescripExtras;
