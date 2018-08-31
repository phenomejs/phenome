const path = require('path');
const fs = require('fs');
const walk = require('./walk');
const codeToAst = require('./code-to-ast');

function searchPropsInVariableDeclaration(ast, declarationName) {
  let foundProps;
  walk(ast, {
    VariableDeclaration(node) {
      node.declarations.forEach((declaration) => {
        if (declaration.id && declaration.id.name === declarationName && declaration.init && declaration.init.properties) {
          foundProps = declaration.init.properties;
        }
      });
    },
  });
  return foundProps;
}

function findObjectSpreadProperties(ast, declarationName, filePath) {
  let objProps;
  const objName = declarationName.split('.')[0];
  const objPath = declarationName.split('.').filter((el, index) => index > 0);

  let importPath;
  let isExternal;
  let importDefault;
  ast.body.forEach((node) => {
    if (node.type === 'ImportDeclaration') {
      node.specifiers.forEach((specifier) => {
        if (specifier.local && specifier.local.name === objName) {
          importPath = path.join(path.dirname(filePath), node.source.value);
          if (importPath.indexOf('.js') < 0) importPath += '.js';
          isExternal = true;
          if (specifier.type === 'ImportDefaultSpecifier') importDefault = true;
        }
      });
    }
  });

  if (isExternal && importPath) {
    const depFileContent = fs.readFileSync(importPath, 'utf8');
    const depFileAst = codeToAst(depFileContent);

    if (importDefault) {
      walk(depFileAst, {
        ExportDefaultDeclaration(node) {
          if (node.declaration.type === 'ObjectExpression') {
            objProps = node.declaration.properties;
          } else if (node.declaration.type === 'Identifier') {
            objProps = searchPropsInVariableDeclaration(depFileAst, node.declaration.name);
          }
        },
      });
    } else {
      objProps = searchPropsInVariableDeclaration(depFileAst, objName);
    }
  }

  if (!isExternal) {
    objProps = searchPropsInVariableDeclaration(ast, objName);
  }

  if (objProps && objPath) {
    objPath.forEach((pathPart) => {
      objProps.forEach((objProp) => {
        if (objProp.key && objProp.key.name === pathPart && objProp.value.type === 'ObjectExpression') {
          objProps = objProp.value.properties;
        }
      });
    });
  }
  return objProps;
}

module.exports = findObjectSpreadProperties;
