import Utils from './utils/utils';
import Mixins from './utils/mixins';

const FabProps = Utils.extend(
  {
    morphTo: String,
    href: [Boolean, String],
    position: {
      type: String,
      default: 'right-bottom',
    },
  },
  Mixins.colorProps,
);

export default {
  name: 'f7-fab',
  props: FabProps,
  render(c) {
    const self = this;
    const { morphTo } = self.props;

    let href = self.props.href;
    if (href === true) href = '#';
    if (href === false) href = undefined; // no href attribute

    const linkEl = (
      <a href={href} onClick={self.onClick.bind(self)} key="f7-fab-link">
        <slot name="link"></slot>
      </a>
    );

    return (
      <div
        id={self.props.id}
        style={self.props.style}
        className={self.classes}
        data-morph-to={morphTo}
      >
        {linkEl}
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
          fab: true,
          'fab-morph': self.morphTo,
          [`fab-${self.props.position}`]: true,
        },
        Mixins.colorClasses(self),
      );
    },
  },
  methods: {
    onClick(event) {
      const self = this;
      self.dispatchEvent('click', event);
    },
  },
};
