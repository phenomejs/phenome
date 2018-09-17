const toCamelCase = require('../../../compiler-utils/to-camel-case');
const astToCode = require('../../../compiler-utils/ast-to-code');
const walk = require('../../../compiler-utils/walk');
const findObjectSpreadProperties = require('../../../compiler-utils/find-object-spread-properties');
const traversePhenomeComponent = require('../../../compiler-utils/traverse-phenome-component');

const dtsTemplate = `
import * as React from 'react';

declare namespace {{name}} {
  interface Props {
    {{props}}
    {{events}}
  }
}
class {{name}} extends React.Component<{{name}}.Props, {}> {
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
        if (subProp.key.name === 'default') {
          prop.default = astToCode(subProp.value, { format: { compact: true } });
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
        const args = [];
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
          } else {
            args.push(astToCode(arg, { format: { compact: true } }));
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

function renderProps(props, indent) {
  return props
    .map((prop) => {
      let type = Array.isArray(prop.type)
        ? prop.type.map(typeMap).join(' | ')
        : typeMap(prop.type);
      if (prop.name === 'style' && type === 'Object') {
        type = 'React.CSSProperties';
      }
      return `${prop.name}${prop.required ? '' : '?'} : ${type} ${prop.default ? ` | ${prop.default}` : ''} `;
    })
    .map(prop => prop.trim())
    .join(`\n${indent}`);
}

function renderEvents(props, indent) {
  return props
    .map((event) => {
      const handlerPropName = event.name.replace(/^([a-z])/, (_, initial) => initial.toUpperCase());
      return `on${handlerPropName}? : Function`;
    })
    .join(`\n${indent}`);
}

function renderMethods(methods, indent) {
  return methods
    .map((method) => { // eslint-disable-line
      return `${method.name}(${method.arguments.map(a => `${a.name}? : any`).join(', ')}) : unknown`;
    })
    .join(`\n${indent}`);
}

const generate = ({ name = 'MyComponent', componentNode, state, ast, input }) => {
  const camelCaseName = toCamelCase(name);
  const props = collectProps(componentNode, ast, input);
  const events = collectEvents(componentNode);
  const methods = collectMethods(componentNode);
  const renderedProps = renderProps(props, '    ');
  const renderedEvents = renderEvents(events, '    ');
  const renderedMethods = renderMethods(methods, '  ');

  const output = dtsTemplate.replace(
    /({{name}})|({{props}})|({{events}})|({{methods}})/g,
    // eslint-disable-next-line
    (_, replaceName, replaceProps, replaceEvents, replaceMethods) => {
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

