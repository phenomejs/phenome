module.exports = (objectExpressionPath) => {
  let hasNameProp = false;
  let hasRenderFunction = false;

  objectExpressionPath.properties.forEach((prop) => {
    if (prop.type === 'ObjectProperty' && prop.key.name === 'name') {
      hasNameProp = true;
    }

    if (prop.type === 'ObjectMethod' && prop.key.name === 'render') {
      hasRenderFunction = true;
    }
  });

  return hasNameProp && hasRenderFunction;
};
