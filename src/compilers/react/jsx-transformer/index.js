const codeToAst = require('../../compiler-utils/code-to-ast');
const walk = require('../../compiler-utils/walk');

function transformJSXText(node) {
  const textValue = node.value.trim().split('\n').map(line => line.trim()).join(' ');

  if (!textValue) {
    return null;
  }
  return Object.assign(node, {
    type: 'Literal',
    raw: `'${textValue}'`,
    value: textValue,
  });
}
function transformJSXExpressionContainer(node, parentNode) {
  const parentElements = parentNode.children || parentNode.arguments;
  parentElements[parentElements.indexOf(node)] = node.expression;
  delete node.expression;
}
function createSlot(node, parentNode) {
  let slotName = 'default';
  node.openingElement.attributes.forEach((attr) => {
    if (attr.name.name === 'name') slotName = attr.name.name;
  });
  const slotNode = codeToAst(`this.slots.${slotName}`).body[0].expression;
  const children = node.children;
  delete node.children;
  delete node.openingElement;
  delete node.closingElement;
  Object.assign(node, slotNode);

  let index = 0;
  const parentElements = parentNode.arguments || parentNode.children || parentNode.elements;

  children.forEach((slotChild) => {
    let child = slotChild;
    if (child.type === 'JSXText') {
      child = transformJSXText(slotChild);
      if (!child) return;
    }
    const slotChildNode = codeToAst(`!this.slots.${slotName} && child`).body[0].expression;
    slotChildNode.right = child;

    if (parentElements && Array.isArray(parentElements)) {
      parentElements.splice(parentElements.indexOf(node) + index + 1, 0, slotChildNode);
    }
    index += 1;
  });
}

function transformJSXElement(node, parentNode, helpers, state) {
  const tagName = node.openingElement.name.name;
  if (tagName === 'slot') {
    helpers.slots = true;
    createSlot(node, parentNode);
    return;
  }
  const newNode = {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'React',
      },
      property: {
        type: 'Identifier',
        name: 'createElement',
      },
    },
    arguments: [],
  };
  if (tagName.match(/[A-Z]/)) {
    newNode.arguments.push({
      type: 'Identifier',
      name: tagName,
    });
  } else {
    newNode.arguments.push({
      type: 'Literal',
      raw: `'${tagName}'`,
      value: tagName,
    });
  }
  if (node.openingElement.attributes.length === 0) {
    newNode.arguments.push({
      type: 'Literal',
      raw: 'null',
      value: null,
    });
  } else {
    const propsObj = {
      type: 'ObjectExpression',
      properties: [],
    };
    node.openingElement.attributes.forEach((attr) => {
      let prop;
      if (attr.type === 'JSXAttribute') {
        prop = {
          type: 'Property',
          computed: false,
          kind: 'init',
          method: false,
          shorthand: false,
          key: {
            type: 'Identifier',
            name: attr.name.name,
          },
        };
        if (!attr.value) {
          prop.value = {
            type: 'Literal',
            raw: 'true',
            value: true,
          };
        } else if (attr.value.type === 'JSXExpressionContainer') {
          prop.value = attr.value.expression;
        } else {
          prop.value = attr.value;
        }
      } else if (attr.type === 'JSXSpreadAttribute') {
        prop = {
          type: 'SpreadElement',
          argument: attr.argument,
        };
      }
      if (prop) propsObj.properties.push(prop);
    });

    newNode.arguments.push(propsObj);
  }
  if (node.children.length > 0) {
    node.children.forEach((child) => {
      if (child.type === 'JSXText') {
        const transformedJSXText = transformJSXText(child);
        if (transformedJSXText) {
          newNode.arguments.push(child);
        }
        return;
      }
      if (child.type === 'JSXExpressionContainer') {
        // eslint-disable-next-line
        child = child.expression;
      }
      if (child.type === 'JSXElement') {
        transformJSXElement(child, node, helpers, state);
      }
      newNode.arguments.push(child);
    });
  }
  Object.assign(node, newNode);
  delete node.children;
  delete node.closingElement;
  delete node.openingElement;
}

// eslint-disable-next-line
const transform = (ast, name, componentNode, state, config) => {
  const helpers = {};

  walk(ast, {
    JSXExpressionContainer(node, path) {
      transformJSXExpressionContainer(node, path[path.length - 2]);
    },
    JSXElement(node, path) {
      transformJSXElement(node, path[path.length - 2], helpers, state);
    },
  });

  walk(ast, {
    JSXElement(node, path) {
      transformJSXElement(node, path[path.length - 2], helpers);
    },
  });

  return { ast, helpers };
};

module.exports = transform;
