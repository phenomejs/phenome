import Utils from '../utils/utils';
import Mixins from '../utils/mixins';

export default {
  name: 'f7-badge',
  props: Mixins.colorProps,
  render() {
    return <span className={this.classes}></span>;
  },
  computed: {
    classes() {
      const self = this;
      return Utils.extend({
        badge: true,
      }, Mixins.colorClasses(self));
    },
  },
};
