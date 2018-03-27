export default (props) => {
  if (!props) return props;

  Object.keys(props).forEach((propName) => {
    let newPropName;

    if (propName === 'class') {
      newPropName = 'className';
    } else {
      newPropName = propName;
    }

    if (propName !== newPropName) {
      props[newPropName] = props[propName];
      delete props[propName];
    }
  });

  return props;
};
