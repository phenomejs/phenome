module.exports = (moduleAst, node, newNode) => {
  if (!newNode) return;
  moduleAst.body[moduleAst.body.indexOf(node)] = newNode;
};
