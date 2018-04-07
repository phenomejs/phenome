const codeToAst = require('../../compiler-utils/code-to-ast');
const walk = require('../../compiler-utils/walk');

const lowerCaseProps = ('acceptCharset accessKey allowFullScreen autoComplete autoFocus autoPlay cellPadding cellSpacing charSet classID className colSpan contentEditable contextMenu controlsList crossOrigin dateTime encType formAction formEncType formMethod formNoValidate formTarget frameBorder hrefLang htmlFor httpEquiv inputMode keyParams keyType marginHeight marginWidth maxLength mediaGroup minLength noValidate radioGroup readOnly rowSpan spellCheck srcDoc srcLang srcSet tabIndex useMap accentHeight alignmentBaseline allowReorder arabicForm attributeName attributeType autoReverse baseFrequency baseProfile baselineShift calcMode capHeight clipPath clipPathUnits clipRule colorInterpolation colorInterpolationFilters colorProfile colorRendering contentScriptType contentStyleType diffuseConstant dominantBaseline edgeMode enableBackground externalResourcesRequired fillOpacity fillRule filterRes filterUnits floodColor floodOpacity fontFamily fontSize fontSizeAdjust fontStretch fontStyle fontVariant fontWeight glyphName glyphOrientationHorizontal glyphOrientationVertical glyphRef gradientTransform gradientUnits horizAdvX horizOriginX imageRendering kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust letterSpacing lightingColor limitingConeAngle markerEnd markerHeight markerMid markerStart markerUnits markerWidth maskContentUnits maskUnits numOctaves overlinePosition overlineThickness paintOrder pathLength patternContentUnits patternTransform patternUnits pointerEvents pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY renderingIntent repeatCount repeatDur requiredExtensions requiredFeatures shapeRendering specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles stopColor stopOpacity strikethroughPosition strikethroughThickness strokeDasharray strokeDashoffset strokeLinecap strokeLinejoin strokeMiterlimit strokeOpacity strokeWidth surfaceScale systemLanguage tableValues targetX targetY textAnchor textDecoration textLength textRendering underlinePosition underlineThickness unicodeBidi unicodeRange unitsPerEm vAlphabetic vHanging vIdeographic vMathematical vectorEffect vertAdvY vertOriginX vertOriginY viewBox viewTarget wordSpacing writingMode xChannelSelector xHeight xlinkActuate xlinkArcrole xlinkHref xlinkRole xlinkShow xlinkTitle xlinkType xmlnsXlink xmlBase xmlLang xmlSpace yChannelSelector zoomAndPan').split(' ');

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
  const slotNode = codeToAst(`this.slots.${slotName}${children.length ? ' || []' : ''}`).body[0].expression;
  if (children.length) {
    slotNode.right.elements = children;
  }
  delete node.children;
  delete node.openingElement;
  delete node.closingElement;
  Object.assign(node, slotNode);
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
        const isStringName = propKeyName.indexOf('-') >= 0;

        prop = {
          type: 'Property',
          computed: false,
          kind: 'init',
          method: false,
          shorthand: false,
          key: {
            type: namespaced || isStringName ? 'Literal' : 'Identifier',
            name: propKeyName,
            raw: namespaced || isStringName ? `'${propKeyName}'` : propKeyName,
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
          const lowerCased = prop.key.name.replace(/(^on?)([A-Z])/, (found, first, second) => second.toLowerCase());
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
        });
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
        transformJSXElement(child, node, helpers, state);
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
// eslint-disable-next-line
function transform(ast, name, componentNode, state, config) {
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

  walk(ast, {
    ExportDefaultDeclaration(node) {
      if (!node.declaration.properties) {
        return;
      }
      node.declaration.properties.forEach((prop) => {
        if (prop.key.name === 'render' && prop.method === true) {
          const createElementNode = codeToAst('var _h = this.$createElement;').body[0];
          prop.value.body.body.unshift(createElementNode);
        }
      });
    },
  });

  if (helpers.transformJSXProps) {
    state.addRuntimeHelper('__transformVueJSXProps', './runtime-helpers/transform-vue-jsx-props.js');
  }

  return { ast, helpers };
}

module.exports = transform;
