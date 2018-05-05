const phenomeComponentObjectProperties = [
  'name',
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
  'shouldComponentUpdate',
  'getSnapshotBeforeUpdate',
  'componentDidCatch',
  'static',
  'functional',
];

module.exports = (phenomeComponentObjectNode, visitors) => {
  for (let i = phenomeComponentObjectNode.properties.length - 1; i >= 0; i -=1) {
    const prop = phenomeComponentObjectNode.properties[i];
    const propertyName = prop.key.name;

    if (visitors[propertyName]) {
      visitors[propertyName](prop);
    }
  }
};
