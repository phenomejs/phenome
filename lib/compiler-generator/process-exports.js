module.exports = (moduleAst, exports) => {
  const exportsList = Object.keys(exports).map(key => exports[key]);

  moduleAst.body.push(...exportsList);
};
