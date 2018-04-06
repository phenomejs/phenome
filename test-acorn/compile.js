const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');
const escodegen = require('escodegen');

const lowerCaseProps = ('acceptCharset accessKey allowFullScreen autoComplete autoFocus autoPlay cellPadding cellSpacing charSet classID className colSpan contentEditable contextMenu controlsList crossOrigin dateTime encType formAction formEncType formMethod formNoValidate formTarget frameBorder hrefLang htmlFor httpEquiv inputMode keyParams keyType marginHeight marginWidth maxLength mediaGroup minLength noValidate radioGroup readOnly rowSpan spellCheck srcDoc srcLang srcSet tabIndex useMap accentHeight alignmentBaseline allowReorder arabicForm attributeName attributeType autoReverse baseFrequency baseProfile baselineShift calcMode capHeight clipPath clipPathUnits clipRule colorInterpolation colorInterpolationFilters colorProfile colorRendering contentScriptType contentStyleType diffuseConstant dominantBaseline edgeMode enableBackground externalResourcesRequired fillOpacity fillRule filterRes filterUnits floodColor floodOpacity fontFamily fontSize fontSizeAdjust fontStretch fontStyle fontVariant fontWeight glyphName glyphOrientationHorizontal glyphOrientationVertical glyphRef gradientTransform gradientUnits horizAdvX horizOriginX imageRendering kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust letterSpacing lightingColor limitingConeAngle markerEnd markerHeight markerMid markerStart markerUnits markerWidth maskContentUnits maskUnits numOctaves overlinePosition overlineThickness paintOrder pathLength patternContentUnits patternTransform patternUnits pointerEvents pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY renderingIntent repeatCount repeatDur requiredExtensions requiredFeatures shapeRendering specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles stopColor stopOpacity strikethroughPosition strikethroughThickness strokeDasharray strokeDashoffset strokeLinecap strokeLinejoin strokeMiterlimit strokeOpacity strokeWidth surfaceScale systemLanguage tableValues targetX targetY textAnchor textDecoration textLength textRendering underlinePosition underlineThickness unicodeBidi unicodeRange unitsPerEm vAlphabetic vHanging vIdeographic vMathematical vectorEffect vertAdvY vertOriginX vertOriginY viewBox viewTarget wordSpacing writingMode xChannelSelector xHeight xlinkActuate xlinkArcrole xlinkHref xlinkRole xlinkShow xlinkTitle xlinkType xmlnsXlink xmlBase xmlLang xmlSpace yChannelSelector zoomAndPan').split(' ');

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
      <div id="test" className="someclass" rootBooleanProp readonly {...propsObj} dangerouslySetInnerHTML="some inner text" onClick={this.onClick} onTabShow={this.onTabShow}>
        <AnotherComponent booleanProp><p>Hello</p></AnotherComponent>
        <slot>World</slot>
        <slot name="header">Default header slot<span>Default span</span></slot>
        here goes some text
        here comes another text
        <p>Inset expression is {this.someArray.join(' ')} good with inset <Component></Component></p>
        <p>{someExpressionComesHere} with one more spread we like but doesn't make sense here {{foo: 'bar', ...wtf}}</p>
        {propsObj ? (<span>Yes</span>) : (<span>No</span>)}
        {someArray.map((el, index) => {
          return <li key={index}>Item {index}</li>
        })}
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

function transformReactJSX() {
  const helpers = {
    slots: false,
    transformJSXProps: false,
  };
  const ast = acorn.parse(content, {
    sourceType: 'module',
    ecmaVersion: '9',
    plugins: { jsx: true },
  });
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
    const slotNode = acorn.parse(`this.slots.${slotName}`).body[0].expression;
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
      const slotChildNode = acorn.parse(`!this.slots.${slotName} && child`).body[0].expression;
      slotChildNode.right = child;

      if (parentElements && Array.isArray(parentElements)) {
        parentElements.splice(parentElements.indexOf(node) + index + 1, 0, slotChildNode);
      }
      index += 1;
    });
  }

  function transformJSXElement(node, parentNode) {
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
          transformJSXElement(child, node);
        }
        newNode.arguments.push(child);
      });
    }
    Object.assign(node, newNode);
    delete node.children;
    delete node.closingElement;
    delete node.openingElement;
  }

  walk.ancestor(ast, {
    JSXExpressionContainer(node, path) {
      transformJSXExpressionContainer(node, path[path.length - 2]);
    },
    JSXElement(node, path) {
      transformJSXElement(node, path[path.length - 2]);
    },
  }, base);

  walk.ancestor(ast, {
    JSXElement(node, path) {
      transformJSXElement(node, path[path.length - 2]);
    },
  }, base);

  return {
    ast,
    helpers,
  };
}


function transformVueJSX() {
  const helpers = {
    slots: false,
    transformJSXProps: false,
  };
  const ast = acorn.parse(content, {
    sourceType: 'module',
    ecmaVersion: '9',
    plugins: { jsx: true },
  });
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
  function createSlot(node) {
    let slotName = 'default';
    node.openingElement.attributes.forEach((attr) => {
      if (attr.name.name === 'name') slotName = attr.name.name;
    });
    const children = [];
    node.children.forEach((slotChild) => {
      let child = slotChild;
      if (child.type === 'JSXText') {
        child = transformJSXText(slotChild);
        if (!child) return;
      }
      children.push(slotChild);
    });
    const slotNode = acorn.parse(`this.slots.${slotName}${children.length ? ' || []' : ''}`).body[0].expression;
    if (children.length) {
      slotNode.right.elements = children;
    }
    delete node.children;
    delete node.openingElement;
    delete node.closingElement;
    Object.assign(node, slotNode);
  }
  function transformJSXElement(node, parentNode) {
    const tagName = node.openingElement.name.name;
    if (tagName === 'slot') {
      helpers.slots = true;
      createSlot(node, parentNode);
      return;
    }
    const newNode = {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: '_h',
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
    if (node.openingElement.attributes.length > 0) {
      let transformJSXProps = false;
      const propsObj = {
        type: 'ObjectExpression',
        properties: [],
      };
      const domProps = [];
      const onProps = [];
      const nestedProps = [];
      const attrsProps = [];
      const nestedPropsKeys = ('style class domProps slot key ref').split(' ');
      node.openingElement.attributes.forEach((attr) => {
        let prop;
        if (attr.type === 'JSXAttribute') {
          const namespaced = attr.name.type === 'JSXNamespacedName';
          const propKeyName = namespaced ? `${attr.name.namespace.name}:${attr.name.name.name}` : attr.name.name;
          prop = {
            type: 'Property',
            computed: false,
            kind: 'init',
            method: false,
            shorthand: false,
            key: {
              type: namespaced ? 'Literal' : 'Identifier',
              name: propKeyName,
              raw: namespaced ? `'${propKeyName}'` : propKeyName,
              value: propKeyName,
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
          if (prop.key.name === 'className') {
            prop.key.name = 'class';
          }
          if (prop.key.name === 'dangerouslySetInnerHTML') {
            // Move to domProps
            prop.key.name = 'innerHTML';
            domProps.push(prop);
          } else if (prop.key.name.match(/^on?([A-Z])/)) {
            // Move to "on" props
            const lowerCased = prop.key.name.replace(/(^on?)([A-Z])/, (found, first, second) => second.toLowerCase());;
            if (namespaced) {
              prop.key.raw = `'${lowerCased}'`;
              prop.key.value = `${lowerCased}`;
            } else {
              prop.key.name = lowerCased;
            }
            onProps.push(prop);
          } else if (nestedPropsKeys.indexOf(prop.key.name) >= 0) {
            // Move to nested props
            nestedProps.push(prop);
          } else {
            // Move to attrs props
            if (lowerCaseProps.indexOf(prop.key.name) >= 0) {
              prop.key.name = prop.key.name.toLowerCase();
            }
            attrsProps.push(prop);
          }
        } else if (attr.type === 'JSXSpreadAttribute') {
          helpers.transformJSXProps = true;
          transformJSXProps = true;
          prop = {
            type: 'SpreadElement',
            argument: attr.argument,
          };
          nestedProps.push(prop);
        }
      });

      // Push nested
      propsObj.properties.push(...nestedProps);

      // Push domProps
      if (domProps.length) {
        propsObj.properties.push({
          type: 'Property',
          computed: false,
          kind: 'init',
          method: false,
          shorthand: false,
          key: {
            type: 'Identifier',
            name: 'domProps',
          },
          value: {
            type: 'ObjectExpression',
            properties: domProps,
          },
        });
      }
      // Push On
      if (onProps.length) {
        propsObj.properties.push({
          type: 'Property',
          computed: false,
          kind: 'init',
          method: false,
          shorthand: false,
          key: {
            type: 'Identifier',
            name: 'on',
          },
          value: {
            type: 'ObjectExpression',
            properties: onProps,
          },
        });
      }
      // Push attrs
      if (attrsProps.length) {
        propsObj.properties.push({
          type: 'Property',
          computed: false,
          kind: 'init',
          method: false,
          shorthand: false,
          key: {
            type: 'Identifier',
            name: 'attrs',
          },
          value: {
            type: 'ObjectExpression',
            properties: attrsProps,
          },
        });
      }

      if (propsObj.properties.length) {
        if (transformJSXProps) {
          newNode.arguments.push({
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: '__transformVueJSXProps',
            },
            arguments: [propsObj],

          })
        } else {
          newNode.arguments.push(propsObj);
        }
      }
    }

    if (node.children.length > 0) {
      const childrenArray = [];
      node.children.forEach((child) => {
        if (child.type === 'JSXText') {
          const transformedJSXText = transformJSXText(child);
          if (transformedJSXText) {
            childrenArray.push(child);
          }
          return;
        }
        if (child.type === 'JSXExpressionContainer') {
          // eslint-disable-next-line
          child = child.expression;
        }
        if (child.type === 'JSXElement') {
          transformJSXElement(child, node);
        }

        childrenArray.push(child);
      });

      if (childrenArray.length) {
        newNode.arguments.push({
          type: 'ArrayExpression',
          elements: childrenArray,
        });
      }
    }
    Object.assign(node, newNode);
    delete node.children;
    delete node.closingElement;
    delete node.openingElement;
  }

  walk.ancestor(ast, {
    JSXExpressionContainer(node, path) {
      transformJSXExpressionContainer(node, path[path.length - 2]);
    },
    JSXElement(node, path) {
      transformJSXElement(node, path[path.length - 2]);
    },
  }, base);

  walk.ancestor(ast, {
    JSXElement(node, path) {
      transformJSXElement(node, path[path.length - 2]);
    },
  }, base);

  walk.ancestor(ast, {
    ExportDefaultDeclaration(node, path) {
      node.declaration.properties.forEach((prop) => {
        if (prop.key.name === 'render' && prop.method === true) {
          const createElementNode = acorn.parse('var _h = this.$createElement;').body[0];
          prop.value.body.body.unshift(createElementNode);
        }
      });
    }
  }, base);

  return {
    ast,
    helpers,
  };
}


const generatedReact = escodegen.generate(transformReactJSX().ast, {
  format: {
    indent: {
      style: '  ',
    },
    compact: false,
  },
});
const generatedVue = escodegen.generate(transformVueJSX().ast, {
  format: {
    indent: {
      style: '  ',
    },
    compact: false,
  },
});

console.log(generatedReact)
console.log(generatedVue)