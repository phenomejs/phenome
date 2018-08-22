const toCamelCase = require('../../../compiler-utils/to-camel-case');
const astToCode = require('../../../compiler-utils/ast-to-code');
const walk = require('../../../compiler-utils/walk');
const traversePhenomeComponent = require('../../../compiler-utils/traverse-phenome-component');

const dtsTemplate = `
namespace {{name}} {
  export interface Props {
      {{props}}
      {{events}}
  }
}
export class {{name}} extends React.Component<{{name}}.Props, {}> {
  {{methods}}
}
`.trim();

function collectProps(componentNode) {
  const props = [];

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
        let name;
        const args = [];
        parentCallNode.arguments.forEach((arg, index) => {
          if (index === 0) {
            // event name
            let hasEvent = false;
            arg.value.split(' ').forEach((eventName) => {
              if (eventsNames.indexOf(eventName) >= 0) {
                hasEvent = true;
              }
              if (hasEvent) return;
              name = eventName;
            });
          } else {
            args.push(astToCode(arg, { format: { compact: true } }));
          }
        });
        events.push({
          name,
          arguments: args,
        });
      }
    },
  });
  return events;
}

function renderProps(props, indent) {
  return props.map(prop => {
    return `${prop.name}${prop.required ? '' : '?'} : any`;
  })
  .join(`\n${indent}`)
}

function renderEvents(props, indent) {
  return props.map(event => {
    const handlerPropName = event.name.replace(/^([a-z])/, (_, initial) => initial.toUpperCase())
    return `on${handlerPropName}? : Function`;
  })
  .join(`\n${indent}`)
}

function renderMethods(methods, indent) {
  return methods.map(method => {
    return `${method.name}(${method.arguments.map(a => `${a.name} : any`).join(', ')}) : unknown`;
  })
  .join(`\n${indent}`)
}

const generate = ({ name = 'MyComponent', ast, componentNode, state, config }) => {
  const camelCaseName = toCamelCase(name);
  const props = collectProps(componentNode);
  const renderedProps = renderProps(props, '      ');
  const events = collectEvents(componentNode);
  const renderedEvents = renderEvents(events, '      ');
  const methods = collectMethods(componentNode);
  const renderedMethods = renderMethods(methods, '  ');

  console.log({ props, methods, events });

  let output = dtsTemplate
    .replace(/({{name}})|({{props}})|({{events}})|({{methods}})/g,
      (_, name, props, events) =>
        name
          ? camelCaseName
          : props
            ? renderedProps
              : events
                ? renderedEvents
                : renderedMethods);

  /*
  process output template with props, methods and events arrays
  */
  console.log(output);
  return output;
};

module.exports = generate;

