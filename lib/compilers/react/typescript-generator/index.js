const toCamelCase = require('../../../compiler-utils/to-camel-case');
const astToCode = require('../../../compiler-utils/ast-to-code');
const walk = require('../../../compiler-utils/walk');
const traversePhenomeComponent = require('../../../compiler-utils/traverse-phenome-component');

const dtsTemplate = `
import React from 'react';

namespace {{name}} {
  export interface Props {
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

function collectProps(componentNode) {
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
  traversePhenomeComponent(componentNode, {
    props(node) {
      node.value.properties.forEach((propNode) => {
        if (propNode.type !== 'Property') return;
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

        props.push(prop);
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
  return props.map((prop) => {
    const type = Array.isArray(prop.type)
      ? prop.type.map(typeMap).join(' | ')
      : typeMap(prop.type);
    return `${prop.name}${prop.required ? '' : '?'} : ${type} ${prop.default ? ` | ${prop.default}` : ''} `;
  }).join(`\n${indent}`);
}

function renderEvents(props, indent) {
  return props.map((event) => {
    const handlerPropName = event.name.replace(/^([a-z])/, (_, initial) => initial.toUpperCase());
    return `on${handlerPropName}? : Function`;
  }).join(`\n${indent}`);
}

function renderMethods(methods, indent) {
  // eslint-disable-next-line
  return methods.map((method) => {
    return `${method.name}(${method.arguments.map(a => `${a.name} : any`).join(', ')}) : unknown`;
  }).join(`\n${indent}`);
}

const generate = ({ name = 'MyComponent', componentNode, state }) => {
  const camelCaseName = toCamelCase(name);
  const props = collectProps(componentNode);
  const events = collectEvents(componentNode);
  const methods = collectMethods(componentNode);
  const renderedProps = renderProps(props, '    ');
  const renderedEvents = renderEvents(events, '    ');
  const renderedMethods = renderMethods(methods, '  ');

  const output = dtsTemplate
    .replace(/{{name}}/g, camelCaseName)
    .replace(/{{props}}/g, renderedProps)
    .replace(/{{events}}/g, renderedEvents)
    .replace(/{{methods}}/g, renderedMethods);
  /*
  process output template with props, methods and events arrays
  */
  state.addTypeScriptDefinition(output);
};

module.exports = generate;

