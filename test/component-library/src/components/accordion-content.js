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
      <div {...propsObj}>
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
