import Utils from '../utils/utils';
import Mixins from '../utils/mixins';

const SubnavbarProps = Utils.extend({
  sliding: Boolean,
  title: String,
  inner: {
    type: Boolean,
    default: true,
  },
}, Mixins.colorProps);

export default {
  name: 'f7-subnavbar',
  props: SubnavbarProps,
  render() {
    const self = this;
    const { inner, title } = self;
    return (
      <div className={classes}>
        {this.props.inner ? (
          <div className="subnavbar-inner">
            {title && <div className="title">{title}</div>}
            <slot></slot>
          </div>
        ) : (
          <slot></slot>
        )}
      </div>
    );
  },
  computed: {
    classes() {
      return Utils.classNames(
        this.props.className,
        {
          subnavbar: true,
          sliding: this.sliding,
        },
        Mixins.colorClasses(this),
      );
    },
  },
};