import Utils from '../utils/utils';
import Mixins from '../utils/mixins';

export default {
  name: 'f7-block-title',
  props: Mixins.colorProps,
  render() {
    return <div className={this.classes}><slot></slot></div>;
  },
  computed: {
    classes() {
      const self = this;
      return Utils.extend({
        'block-title': true,
      }, Mixins.colorClasses(self));
    },
  },
};
