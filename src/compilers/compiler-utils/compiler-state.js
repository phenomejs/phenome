const stackTrace = require('stack-trace');
const path = require('path');

const codeToAst = require('./code-to-ast');

class CompilerState {
  constructor() {
    this.runtimeHelpers = new Set();
    this.imports = {};
    this.declarations = {};
  }

  addRuntimeHelper(name, relativePath) {
    const callingModuleFile = stackTrace.get()[1].getFileName();
    const fullPath = path.join(path.dirname(callingModuleFile), relativePath);
    this.runtimeHelpers.add(fullPath);
    this.addImport(name, `../runtime-helpers/${path.basename(fullPath)}`);
  }

  addImport(name, from, importDefault = true) {
    const importCode = `import ${importDefault ? '' : '{'}${name}${importDefault ? '' : '}'} from '${from}'`;
    this.imports[name] = codeToAst(importCode).program.body[0];
  }

  addDeclaration(name, node, afterComponent = false) {
    this.declarations[name] = {
      node,
      afterComponent,
    };
  }
}

module.exports = CompilerState;
