const getLastImportIndex = (moduleAst) => {
  let lastImportNodeIndex = 0;

  while (moduleAst.body.length && moduleAst.body[lastImportNodeIndex].type === 'ImportDeclaration') {
    lastImportNodeIndex += 1;
  }

  return lastImportNodeIndex;
};

module.exports = (moduleAst, imports) => {
  const importsList = Object.keys(imports)
    .filter(key => !imports[key].absolute)
    .map(key => imports[key]);

  const absoluteImportsList = Object.keys(imports)
    .filter(key => imports[key].absolute && imports[key].ast)
    .map(key => imports[key].ast);

  moduleAst.body.splice(getLastImportIndex(moduleAst), 0, ...importsList);

  if (absoluteImportsList.length) {
    moduleAst.body.unshift(...absoluteImportsList);
  }
};

module.exports.getLastImportIndex = getLastImportIndex;
