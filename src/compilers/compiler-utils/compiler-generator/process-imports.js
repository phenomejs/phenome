const getLastImportIndex = (moduleAst) => {
  let lastImportNodeIndex = 0;

  while (moduleAst.program.body.length && moduleAst.program.body[lastImportNodeIndex].type === 'ImportDeclaration') {
    lastImportNodeIndex += 1;
  }

  return lastImportNodeIndex;
};

module.exports = (moduleAst, imports) => {
  const importsList = Object.keys(imports).map(key => imports[key]);

  moduleAst.program.body.splice(getLastImportIndex(moduleAst), 0, ...importsList);
};

module.exports.getLastImportIndex = getLastImportIndex;
