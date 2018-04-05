const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');
const escodegen = require('escodegen');

const content = `
import Utils from '../utils/utils';
import Mixins from '../utils/mixins';

export default {
  props: Mixins.colorProps,
  name: 'f7-accordion-content',
  render() {
    const propsObj = {
      id: this.props.id,
      style: this.props.style,
      className: this.classes,
    };

    const someArray = [1, 2, 3, 4];
    const arrayWithSpread = [...someArray, 5, 6];

    const someObject = { foo: 'test', bar: 'test2' };
    const objectWithSpread = { ...someObject, baz: 'test3' };

    return (
      <div id="test" className="someclass" rootBooleanProp readonly {...propsObj}>
        <AnotherComponent booleanProp><p>Hello</p></AnotherComponent>
        <slot>World</slot>
        <slot name="header">Default header slot</slot>
        here goes some text
        here comes another text
        <p>Inset expression is {this.someArray.join(' ')} good with inset <Component></Component></p>
        <p>{someExpressionComesHere} with one more spread we like but doesn't make sense here {{foo: 'bar', ...wtf}}</p>
        {propsObj ? (<span>Yes</span>) : (<span>No</span>)}
      </div>
    );
  },
  computed: {
    classes() {
      const self = this;
      return Utils.classNames(
        self.props.className,
        {
          'accordion-item-content': true,
        },
        Mixins.colorClasses(self)
      );
    },
  },
};
`;
const base = {
  JSXElement(node, st, c) {
    node.children.forEach((n) => {
      c(n, st);
    });
  },
  JSXExpressionContainer(node, st, c) {
    c(node.expression, st);
  },
  JSXText() {},
  ...walk.base,
};
const ast = acorn.parse(content, {
  sourceType: 'module',
  ecmaVersion: '9',
  plugins: { jsx: true },
});

function transformJSXText(node, parents) {
  const textValue = node.value.trim().split('\n').map(line => line.trim()).join(' ');
  const parentNode = parents[parents.length - 2];

  if (!textValue) {
    parentNode.children.splice(parentNode.children.indexOf(node), 1);
  } else {
    Object.assign(node, {
      type: 'Literal',
      raw: `'${textValue}'`,
      value: textValue,
    });
  }
}
function transformJSXElement(node, parents) {
  const all = acorn.parse(`React.createElement('div', {asd: true}, 'Yes')`)
  const nullProps = acorn.parse(`React.createElement('div', null, 'Yes')`)
  const component = acorn.parse(`React.createElement(MyPage, null, 'Yes')`)
  const propsWithSpread = acorn.parse(`React.createElement(MyPage, {id: '2', ...propsObj}, 'Yes')`, {
    ecmaVersion: '9',
  });
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
  const tagName = node.openingElement.name.name;
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
        transformJSXText(child, [node]);
      }
      if (child.type === 'JSXExpressionContainer') {
        transformJSXExpressionContainer(child, [node]);
      }
      newNode.arguments.push(child);
    });
  }
  Object.assign(node, newNode);
  delete node.children;
  delete node.closingElement;
  delete node.openingElement;
}
function transformJSXExpressionContainer(node, parents) {
  const parentNode = parents[parents.length - 2];
  parentNode.children[parentNode.children.indexOf(node)] = node.expression;
  delete node.expression;
}


walk.ancestor(ast, {
  JSXText(node, parents) {
    transformJSXText(node, parents);
  },
}, base);

walk.ancestor(ast, {
  JSXExpressionContainer(node, parents) {
    transformJSXExpressionContainer(node, parents);
  },
  JSXElement(node, parents) {
    transformJSXElement(node, parents);
  },
}, base);

const generated = escodegen.generate(ast, {
  format: {
    indent: {
      style: '  ',
    },
    compact: false,
  },
});
console.log(generated);