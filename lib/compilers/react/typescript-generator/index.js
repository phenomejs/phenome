const toCamelCase = require('../../../compiler-utils/to-camel-case');
const astToCode = require('../../../compiler-utils/ast-to-code');
const walk = require('../../../compiler-utils/walk');
const findObjectSpreadProperties = require('../../../compiler-utils/find-object-spread-properties');
const traversePhenomeComponent = require('../../../compiler-utils/traverse-phenome-component');

const dtsTemplate = `
import * as React from 'react';
{{imports}}

declare namespace {{name}} {
  interface Props {
    {{props}}
    {{events}}
  }
}
declare class {{name}} extends React.Component<{{name}}.Props, {}> {
  {{methods}}
}
export default {{name}};
`.trim();

function typeMap(type) {
  const map = {
    Boolean: 'boolean',
    String: 'string',
    Array: 'Array<any>',
    Number: 'number',
    Function: 'Function',
    Object: 'Object',
  };
  if (map[type]) return map[type];
  if (type[0].toUpperCase() === type[0]) return type;
  return 'any';
}

function collectProps(componentNode, ast, input) {
  const props = [{
    name: 'slot',
    type: 'String',
  }];

  function getPropType(node) {
    if (node.type === 'Identifier') return node.name;
    if (node.type === 'ArrayExpression') return node.elements.map(el => el.name);
    if (node.type === 'MemberExpression') return astToCode(node, { format: { compact: true } });
    return 'any';
  }

  function getProp(propNode) {
    const prop = {
      name: propNode.key.name,
    };
    if (propNode.value.type === 'Identifier' || propNode.value.type === 'MemberExpression') {
      /* foo: String */
      prop.type = propNode.value.name;
      prop.type = getPropType(propNode.value);
      prop.required = false;
    } else if (propNode.value.type === 'ArrayExpression') {
      /* foo: [String, Number] */
      prop.type = propNode.value.elements.map(el => el.name);
      prop.type = getPropType(propNode.value);
      prop.required = false;
    } else if (propNode.value.type === 'ObjectExpression') {
      /* foo: { type: String, default: 'bar', required: true } */
      propNode.value.properties.forEach((subProp) => {
        if (subProp.key.name === 'type') {
          prop.type = getPropType(subProp.value);
        }
        if (subProp.key.name === 'required') {
          prop.required = subProp.value.value;
        }
      });
    }
    return prop;
  }
  traversePhenomeComponent(componentNode, {
    props(node) {
      node.value.properties.forEach((propNode) => {
        if (propNode.type !== 'Property') {
          if (propNode.type === 'SpreadElement') {
            let objProps;
            if (propNode.argument.type === 'Identifier') {
              objProps = findObjectSpreadProperties(ast, propNode.argument.name, input.fullPath);
            } else if (propNode.argument.type === 'MemberExpression') {
              objProps = findObjectSpreadProperties(ast, astToCode(propNode.argument), input.fullPath);
            }
            if (objProps) {
              objProps.forEach((objPropNode) => {
                const prop = getProp(objPropNode);
                if (prop) props.push(prop);
              });
            }
          }
          return;
        }
        const prop = getProp(propNode);
        if (prop) props.push(prop);
      });
    },
  });

  return props;
}
function collectMethods(componentNode) {
  const methods = [];
  traversePhenomeComponent(componentNode, {
    methods(node) {
      if (node.type !== 'Property') return;
      node.value.properties.forEach((methodNode) => {
        if (methodNode.value.type !== 'FunctionExpression') return;
        const method = {
          name: methodNode.key.name,
          arguments: methodNode.value.params.map((param) => {
            if (param.type === 'AssignmentPattern') {
              // Default value: open(animate = true)
              return {
                name: param.left.name,
                default: astToCode(param.right, { format: { compact: true } }),
              };
            }
            // Usual: open(animate)
            return { name: param.name };
          }),
        };
        methods.push(method);
      });
    },
  });
  return methods;
}
function collectEvents(componentNode) {
  const thisAliases = ('this that self component').split(' ');
  const events = [];
  const eventsNames = [];
  walk(componentNode, {
    MemberExpression(node, path) {
      if (
        (
          (node.object.type === 'ThisExpression') ||
          (node.object.type === 'Identifier' && thisAliases.indexOf(node.object.name) >= 0)
        ) &&
        node.property.type === 'Identifier' &&
        node.property.name === 'dispatchEvent'
      ) {
        const parentCallNode = path[path.length - 2];
        if (parentCallNode.type !== 'CallExpression') return;
        const names = [];
        let args = [];
        parentCallNode.arguments.forEach((arg, index) => {
          if (index === 0) {
            // event name
            arg.value.split(' ').forEach((eventName) => {
              if (names.indexOf(eventName) >= 0 || eventsNames.indexOf(eventName) >= 0) {
                return;
              }
              eventsNames.push(eventName);
              names.push(eventName);
            });
          } else if (arg.type === 'Identifier') {
            args.push(arg.name);
          } else {
            args = [];
          }
        });
        names.forEach((name) => {
          if (name.match(/[-:+*/\\]/)) return;
          events.push({
            name,
            arguments: args,
          });
        });
      }
    },
  });
  return events;
}

function renderProps(props, indent, extraProps) {
  let propsString = props
    .map((prop) => {
      let type = Array.isArray(prop.type)
        ? prop.type.map(typeMap).join(' | ')
        : typeMap(prop.type);
      if (prop.name === 'style' && type === 'Object') {
        type = 'React.CSSProperties';
      }
      return `${prop.name}${prop.required ? '' : '?'} : ${type} `;
    })
    .map(prop => prop.trim())
    .join(`\n${indent}`);

  if (extraProps && extraProps.length) {
    propsString += propsString.length ? `\n${indent}` : '';
    propsString += extraProps
      .map(prop => prop.split('\n'))
      .reduce((acc, val) => acc.concat(val), [])
      .map(prop => prop.trim())
      .join(`\n${indent}`);
  }
  return propsString;
}

function renderEvents(props, indent) {
  return props
    .map((event) => {
      const handlerPropName = event.name.replace(/^([a-z])/, (_, initial) => initial.toUpperCase());
      const args = event.arguments && event.arguments.length
        ? event.arguments.map(a => `${a}?: any`).join(', ')
        : '...args: any[]';
      return `on${handlerPropName}? : (${args}) => void`;
    })
    .join(`\n${indent}`);
}

function renderMethods(methods, indent, extraMethods) {
  let methodsString = methods
    .map((method) => { // eslint-disable-line
      return `${method.name}(${method.arguments.map(a => `${a.name}? : any`).join(', ')}) : unknown`;
    })
    .join(`\n${indent}`);
  if (extraMethods && extraMethods.length) {
    methodsString += methodsString.length ? `\n${indent}` : '';
    methodsString += extraMethods
      .map(method => method.split('\n'))
      .reduce((acc, val) => acc.concat(val), [])
      .map(method => method.trim())
      .join(`\n${indent}`);
  }
  return methodsString;
}

const generate = ({ name = 'MyComponent', componentNode, state, ast, input, typescriptExtras }) => {
  const camelCaseName = toCamelCase(name);
  const props = collectProps(componentNode, ast, input);
  const events = collectEvents(componentNode);
  const methods = collectMethods(componentNode);
  const renderedProps = renderProps(props, '    ', typescriptExtras && typescriptExtras.props);
  const renderedEvents = renderEvents(events, '    ');
  const renderedMethods = renderMethods(methods, '  ', typescriptExtras && typescriptExtras.instance);

  const extraImports = typescriptExtras && typescriptExtras.imports && typescriptExtras.imports.length
    ? `${typescriptExtras.imports.join('\n')}\n`
    : '';

  const output = dtsTemplate.replace(
    /({{imports}}\n)|({{name}})|({{props}})|({{events}})|({{methods}})/g,
    // eslint-disable-next-line
    (_, replaceImports, replaceName, replaceProps, replaceEvents, replaceMethods) => {
      if (replaceImports) return extraImports;
      if (replaceName) return camelCaseName;
      else if (replaceProps) return renderedProps;
      else if (replaceEvents) return renderedEvents;
      else if (replaceMethods) return renderedMethods;
    },
  );

  /*
  process output template with props, methods and events arrays
  */
  state.addTypeScriptDefinition(output);
};

module.exports = generate;

