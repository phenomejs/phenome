const stackTrace = require('stack-trace');
const path = require('path');

const codeToAst = require('./code-to-ast');

class CompilerState {
  constructor() {
    this.runtimeDependencies = new Set();
    this.imports = {};
    this.declarations = {};
  }

  addRuntimeDependency(name, relativePath) {
    const callingModuleFile = stackTrace.get()[1].getFileName();
    const fullPath = path.join(path.dirname(callingModuleFile), relativePath);
    this.runtimeDependencies.add(fullPath);
    this.addImport(name, `./runtime-dependencies/${path.getFileName(fullPath)}`, false)
  }

  addImport(name, from, importDefault = true) {
    const importCode = `import ${importDefault ? '' : '{'}${name}${importDefault ? '}' : ''} from '${from}'`;
    this.imports[name] = codeToAst(importCode).program.body[0];
  }

  addDeclaration(name, node) {
    this.declarations[name] = node;
  }
}

module.exports = CompilerState;