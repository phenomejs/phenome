const { getLastImportIndex } = require('./process-imports');

module.exports = (moduleAst, declarations) => {
  const allFlattenedDeclarations = Object.keys(declarations)
    .reduce((currentList, nextKey) => {
      const declarationsForKey = declarations[nextKey];

      if (Array.isArray(declarationsForKey)) {
        return [...currentList, ...declarationsForKey];
      }

      return [...currentList, declarationsForKey];
    }, []);

  const beforeComponentDeclarations = allFlattenedDeclarations
    .filter(declaration => !declaration.afterComponent)
    .map(declaration => declaration.node);

  moduleAst.body.splice(getLastImportIndex(moduleAst), 0, ...beforeComponentDeclarations);

  const afterComponentDeclarations = allFlattenedDeclarations
    .filter(declaration => declaration.afterComponent)
    .map(declaration => declaration.node);

  moduleAst.body.push(...afterComponentDeclarations);
};
