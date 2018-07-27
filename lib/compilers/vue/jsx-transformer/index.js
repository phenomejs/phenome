const codeToAst = require('../../../compiler-utils/code-to-ast');
const walk = require('../../../compiler-utils/walk');

const lowerCaseProps = ('acceptCharset accessKey allowFullScreen autoComplete autoCorrect autoCapitalize autoFocus autoPlay cellPadding cellSpacing charSet classID className colSpan contentEditable contextMenu controlsList crossOrigin dateTime encType formAction formEncType formMethod formNoValidate formTarget frameBorder hrefLang htmlFor httpEquiv inputMode keyParams keyType marginHeight marginWidth maxLength mediaGroup minLength noValidate radioGroup readOnly rowSpan spellCheck srcDoc srcLang srcSet tabIndex useMap').split(' ');

const kebabCaseProps = {
  accentHeight: 'accent-height',
  alignmentBaseline: 'alignment-baseline',
  arabicForm: 'arabic-form',
  baselineShift: 'baseline-shift',
  capHeight: 'cap-height',
  clipPath: 'clip-path',
  clipRule: 'clip-rule',
  colorInterpolation: 'color-interpolation',
  colorInterpolationFilters: 'color-interpolation-filters',
  colorProfile: 'color-profile',
  colorRendering: 'color-rendering',
  dominantBaseline: 'dominant-baseline',
  enableBackground: 'enable-background',
  fillOpacity: 'fill-opacity',
  fillRule: 'fill-rule',
  floodColor: 'flood-color',
  floodOpacity: 'flood-opacity',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontSizeAdjust: 'font-size-adjust',
  fontStretch: 'font-stretch',
  fontStyle: 'font-style',
  fontVariant: 'font-variant',
  fontWeight: 'font-weight',
  glyphName: 'glyph-name',
  glyphOrientationHorizontal: 'glyph-orientation-horizontal',
  glyphOrientationVertical: 'glyph-orientation-vertical',
  horizAdvX: 'horiz-adv-x',
  horizOriginX: 'horiz-origin-x',
  imageRendering: 'image-rendering',
  letterSpacing: 'letter-spacing',
  lightingColor: 'lighting-color',
  markerEnd: 'marker-end',
  markerMid: 'marker-mid',
  markerStart: 'marker-start',
  overlinePosition: 'overline-position',
  overlineThickness: 'overline-thickness',
  panose1: 'panose-1',
  paintOrder: 'paint-order',
  pointerEvents: 'pointer-events',
  renderingIntent: 'rendering-intent',
  shapeRendering: 'shape-rendering',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  strikethroughPosition: 'strikethrough-position',
  strikethroughThickness: 'strikethrough-thickness',
  strokeDasharray: 'stroke-dasharray',
  strokeDashoffset: 'stroke-dashoffset',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeOpacity: 'stroke-opacity',
  strokeWidth: 'stroke-width',
  textAnchor: 'text-anchor',
  textDecoration: 'text-decoration',
  textRendering: 'text-rendering',
  underlinePosition: 'underline-position',
  underlineThickness: 'underline-thickness',
  unicodeBidi: 'unicode-bidi',
  unicodeRange: 'unicode-range',
  unitsPerEm: 'units-per-em',
  vAlphabetic: 'v-alphabetic',
  vHanging: 'v-hanging',
  vIdeographic: 'v-ideographic',
  vMathematical: 'v-mathematical',
  vertAdvY: 'vert-adv-y',
  vertOriginX: 'vert-origin-x',
  vertOriginY: 'vert-origin-y',
  wordSpacing: 'word-spacing',
  writingMode: 'writing-mode',
  xHeight: 'x-height',
};

// eslint-disable-next-line
const upperCaseProps = 'allowReorder attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits contentScriptType contentStyleType diffuseConstant edgeMode externalResourcesRequired filterRes filterUnits glyphRef gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan'.split(' ');

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
function createSlot(node, functional, renderArgs) {
  let slotName = 'default';
  node.openingElement.attributes.forEach((attr) => {
    // console.log(attr);
    if (attr.name.name === 'name') slotName = attr.value.value;
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
  const slotsObj = functional ? renderArgs[2] : 'this.$slots';
  const slotNode = codeToAst(`${slotsObj}['${slotName}']${children.length ? ' || []' : ''}`).body[0].expression;
  if (children.length) {
    slotNode.right.elements = children;
  }
  delete node.children;
  delete node.openingElement;
  delete node.closingElement;
  Object.assign(node, slotNode);
}
function transformJSXElement(node, parentNode, helpers, functional, renderArgs) {
  const tagName = node.openingElement.name.name;
  if (tagName === 'slot') {
    if (!functional) {
      helpers.slots = true;
    }
    createSlot(node, functional, renderArgs);
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
    const nestedPropsKeys = ('style class domProps slot key ref attrs on props').split(' ');
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
          if (prop.value.type === 'ObjectExpression') {
            prop.value = prop.value.properties[0].value;
          } else {
            helpers.transformJSXProps = true;
            transformJSXProps = true;
          }
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
          if (kebabCaseProps[prop.key.name]) {
            prop.key.name = kebabCaseProps[prop.key.name];
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
    let attrsPropsWasNested = false;
    let domPropsWasNested = false;
    let onPropsWasNested = false;
    nestedProps.forEach((prop) => {
      if (attrsProps.length && prop && prop.key && prop.key.name === 'attrs') {
        attrsPropsWasNested = true;
        prop.value.properties.push(...attrsProps);
      }
      if (domProps.length && prop && prop.key && prop.key.name === 'domProps') {
        domPropsWasNested = true;
        prop.value.properties.push(...domProps);
      }
      if (onProps.length && prop && prop.key && prop.key.name === 'on') {
        onPropsWasNested = true;
        prop.value.properties.push(...onProps);
      }
    });

    propsObj.properties.push(...nestedProps);

    // Push domProps
    if (!domPropsWasNested && domProps.length) {
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
    if (!onPropsWasNested && onProps.length) {
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
    if (!attrsPropsWasNested && attrsProps.length) {
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
            name: '__vueComponentTransformJSXProps',
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
        transformJSXElement(child, node, helpers, functional, renderArgs);
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
function transform({ ast, functional, componentNode, state }) {
  const helpers = {};
  const renderArgs = ['props', 'children', 'slots'];
  componentNode.properties.forEach((prop) => {
    if (prop.key.name === 'render' && prop.method === true) {
      if (functional) {
        let needProps;
        let needChildren;
        let needSlots;
        prop.value.params.forEach((param, index) => {
          if (index === 0) needProps = true;
          if (index === 1) needChildren = true;
          if (index === 2) needSlots = true;
          renderArgs[index] = param.name;
        });
        prop.value.params = [
          { type: 'Identifier', name: '$createElement' },
          { type: 'Identifier', name: '$context' },
        ];
        const createElementNode = codeToAst('const _h = $createElement;').body[0];
        const declareVars = [];
        if (needProps) {
          const propsNode = codeToAst(`const ${renderArgs[0]} = $context.props;`).body[0];
          declareVars.push(propsNode);
        }
        if (needChildren) {
          const childrenNode = codeToAst(`const ${renderArgs[1]} = $context.children;`).body[0];
          declareVars.push(childrenNode);
        }
        if (needSlots) {
          const slotsNode = codeToAst(`const ${renderArgs[2]} = $context.slots();`).body[0];
          declareVars.push(slotsNode);
        }

        prop.value.body.body.unshift(createElementNode, ...declareVars);
      } else {
        const createElementNode = codeToAst('const _h = this.$createElement;').body[0];
        prop.value.body.body.unshift(createElementNode);
      }
    }
  });

  walk(ast, {
    JSXExpressionContainer(node, path) {
      transformJSXExpressionContainer(node, path[path.length - 2]);
    },
    JSXElement(node, path) {
      transformJSXElement(node, path[path.length - 2], helpers, functional, renderArgs);
    },
  });

  walk(ast, {
    JSXElement(node, path) {
      transformJSXElement(node, path[path.length - 2], helpers, functional, renderArgs);
    },
  });

  if (helpers.transformJSXProps) {
    state.addRuntimeHelper('__vueComponentTransformJSXProps', './runtime-helpers/vue-component-transform-jsx-props.js');
  }

  return { ast, helpers };
}

module.exports = transform;
