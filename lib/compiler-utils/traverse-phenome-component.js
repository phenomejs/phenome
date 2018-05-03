const phenomeComponentObjectProperties = [
  'state',
  'methods',
  'computed',
  'render',
  'props',
  'watch',
  'componentWillCreate',
  'componentDidCreate',
  'componentWillMount',
  'componentDidMount',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount',
];

module.exports = (phenomeComponentObjectNode, visitors) => {
  phenomeComponentObjectNode.properties.forEach((prop) => {
    if (phenomeComponentObjectProperties.indexOf(prop.key && prop.key.name) !== -1) {
      const propertyName = prop.key.name;

      if (visitors[propertyName]) {
        visitors[propertyName](prop);
      }
    }
  });
};
