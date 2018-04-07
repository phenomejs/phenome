const stackTrace = require('stack-trace');
const path = require('path');

const codeToAst = require('./code-to-ast');

class CompilerState {
  constructor() {
    this.runtimeHelpers = new Set();
    this.imports = {};
    this.exports = {};
    this.declarations = {};
    this.newComponentNode = null;
  }

  addRuntimeHelper(name, relativePath) {
    const callingModuleFile = stackTrace.get()[1].getFileName();
    const fullPath = path.join(path.dirname(callingModuleFile), relativePath);
    this.runtimeHelpers.add(fullPath);
    this.addImport(name, `../runtime-helpers/${path.basename(fullPath)}`);
  }

  addImport(name, from, importDefault = true, absolute) {
    const importCode = `import ${importDefault ? '' : '{'}${name}${importDefault ? '' : '}'} from '${from}'`;
    const importAst = codeToAst(importCode).body[0];
    if (absolute) {
      this.imports[name] = {
        absolute: true,
        ast: importAst,
      }
    } else {
      this.imports[name] = importAst;
    }
  }

  addDeclaration(name, node, afterComponent = false) {
    this.declarations[name] = {
      node,
      afterComponent,
    };
  }

  replaceComponentNode(newNode) {
    this.newComponentNode = newNode;
  }

  addExport(name, from, exportDefault = true) {
    const exportParts = ['export'];
    if (exportDefault) exportParts.push(`default ${name}`);
    else exportParts.push(`{${name}}`);
    if (from) exportParts.push(`from ${from}`);

    this.exports[name] = codeToAst(exportParts.join(' ')).body[0];
  }
}

module.exports = CompilerState;
