import Utils from './utils/utils';
import Mixins from './utils/mixins';
import f7Vue from './utils/f7-vue'; // phenome-vue-line
import f7React from './utils/f7-react'; // phenome-react-line

export default {
  name: 'f7-app',
  props: {
    framework7: Function,
    react: [Object, Function],
    vue: Function,
    params: Object,
    routes: Array,
  },
  render() {
    const self = this;

    const classes = Utils.classNames(
      self.props.className,
      {
        'framework7-root': true,
      },
      Mixins.colorClasses(self),
    );

    return (
      <div ref="el" id="framework7-root" className={classes}>
        <slot></slot>
      </div>
    );
  },
  componentDidCreate() {
    const self = this;
    let { framework7, vue, react } = self.props;
    const { params = {} } = self.props;

    if (!framework7 && typeof window !== 'undefined') framework7 = window.Framework7 || window.framework7;

    if (!vue && typeof window !== 'undefined') vue = window.Vue || window.vue; // phenome-vue-line
    if (!react && typeof window !== 'undefined') react = window.React || window.react; // phenome-react-line

    f7Vue.install(framework7, vue, params); // phenome-vue-line
    f7React.install(framework7, react, params); // phenome-react-line
  },
  componentDidMount() {
    const self = this;
    let { framework7 } = self.props;
    const { params = {}, routes } = self.props;
    const el = self.refs.el;
    if (!framework7 && typeof window !== 'undefined') framework7 = window.Framework7 || window.framework7;
    const parentEl = el.parentNode;

    if (parentEl && parentEl !== document.body && parentEl.parentNode === document.body) {
      parentEl.style.height = '100%';
    }
    // phenome-vue-next-line
    f7Vue.init(framework7, el, params, routes);
    // phenome-react-next-line
    f7React.init(framework7, el, params, routes);
  },
};
