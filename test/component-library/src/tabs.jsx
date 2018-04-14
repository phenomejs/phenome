import Utils from './utils/utils';
import Mixins from './utils/mixins';

const TabsProps = Utils.extend({
  animated: Boolean,
  swipeable: Boolean,
  routable: Boolean,
}, Mixins.colorProps);

export default {
  name: 'f7-tabs',
  props: TabsProps,
  render() {
    const self = this;
    const { animated, swipeable, id, style, className } = self.props;

    if (animated || swipeable) {
      return (
        <div className={self.classes}>
          <div className="tabs">
            <slot></slot>
          </div>
        </div>
      );
    }
    return (
      <div id={id} style={style} className={Utils.classNames('tabs', this.classes)}>
        <slot></slot>
      </div>
    );
  },
  computed: {
    classes() {
      return Utils.classNames(
        this.props.className,
        {
          'tabs-animated-wrap': this.props.animated,
          'tabs-swipeable-wrap': this.props.swipeable,
          'tabs-routable': this.props.routable,
        },
        Mixins.colorClasses(this),
      );
    },
  },
};
