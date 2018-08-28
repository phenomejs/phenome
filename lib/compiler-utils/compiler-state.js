const stackTrace = require('stack-trace');
const path = require('path');

const codeToAst = require('./code-to-ast');

class CompilerState {
  constructor(config, output) {
    this.config = config;
    this.output = output;
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

    const { basePath, filePath } = this.output;

    const helperAbsolutePath = path.resolve(basePath, relativePath);
    let helperImportPath = path.relative(path.dirname(filePath), helperAbsolutePath);
    if (['/', '.'].indexOf(helperImportPath[0]) < 0) {
      helperImportPath = `./${helperImportPath}`;
    }

    this.addImport(name, helperImportPath);
  }

  addImport(name, from, importDefault = true, absolute) {
    if (process.platform.indexOf('win') === 0) {
      // eslint-disable-next-line
      from = from.replace(/\\/g, '/');
    }
    const importCode = `import ${importDefault ? '' : '{'}${name}${importDefault ? '' : '}'} from '${from}'`;
    const importAst = codeToAst(importCode).body[0];
    if (absolute) {
      this.imports[name] = {
        absolute: true,
        ast: importAst,
      };
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

  addTypeScriptDefinition(ts) {
    this.typeScriptDefinition = ts;
  }
}

module.exports = CompilerState;
