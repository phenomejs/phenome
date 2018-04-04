const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');

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
      <div className={this.test + 5}>Hello
        <slot></slot>
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
const ast = acorn.parse(content, {
  sourceType: 'module',
  ecmaVersion: '9',
  plugins: { jsx: true },
});

walk.simple(ast, {
  JSXElement(node) {
    console.log('JSXElement', node);
  },
  JSXExpressionContainer(node) {
    console.log('JSXExpressionContainer', node);
  },
}, {
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
});
