/* eslint no-param-reassign: "off" */
/* eslint no-underscore-dangle: "off" */
import Utils from './utils';
import ComponentsRouter from './f7-components-router';

import routers from './routers';
import events from './events';

const f7 = {
  instance: undefined,
  install(Framework7, Vue, params = {}) {
    // Check for F7
    if (typeof Framework7 === 'undefined') {
      throw new Error('Framework7 is undefined, make sure you have passed it under "framework7" prop to <f7-app> component');
    }
    if (typeof Vue === 'undefined') {
      throw new Error('Vue is undefined, make sure you have passed it under "vue" prop to <f7-app> component');
    }
    // Define protos
    Object.defineProperty(Vue.prototype, '$f7', {
      get() {
        return f7.instance;
      },
    });

    const $theme = {};
    const { theme } = params;
    if (theme === 'md') $theme.md = true;
    if (theme === 'ios') $theme.ios = true;
    if (!theme || theme === 'auto') {
      $theme.ios = !!(Framework7.Device || Framework7.device).ios;
      $theme.md = !(Framework7.Device || Framework7.device).ios;
    }
    Object.defineProperty(Vue.prototype, '$theme', {
      get() {
        return {
          ios: f7.instance ? f7.instance.theme === 'ios' : $theme.ios,
          md: f7.instance ? f7.instance.theme === 'md' : $theme.md,
        };
      },
    });
    function f7ready(callback) {
      f7.ready(callback);
    }
    Vue.prototype.Dom7 = Framework7.$;
    Vue.prototype.$$ = Framework7.$;
    Vue.prototype.$device = Framework7.device;
    Vue.prototype.$request = Framework7.request;
    Vue.prototype.$utils = Framework7.utils;
    Vue.prototype.$f7ready = f7ready;
    Vue.prototype.$f7Ready = f7ready;

    Object.defineProperty(Vue.prototype, '$f7route', {
      get() {
        const self = this;
        let route;
        let parent = self;
        if (self._f7route) route = self._f7route;
        while (parent && !route) {
          if (parent._f7route) route = parent._f7route;
          parent = parent.$parent;
        }
        return route;
      },
      set(value) {
        const self = this;
        self._f7route = value;
      },
    });
    Object.defineProperty(Vue.prototype, '$f7router', {
      get() {
        const self = this;
        let router;
        let parent = self;
        if (self._f7router) router = self._f7router;
        while (parent && !router) {
          if (parent._f7router) router = parent._f7router;
          else if (parent.f7View) {
            router = parent.f7View.router;
          } else if (parent.$refs && parent.$refs.el && parent.$refs.el.f7View) {
            router = parent.$refs.el.f7View.router;
          }
          parent = parent.$parent;
        }
        return router;
      },
      set(value) {
        const self = this;
        self._f7router = value;
      },
    });

    // Extend F7 Router
    Framework7.Router.use(ComponentsRouter);
  },
  init(Framework7, rootEl, params = {}, routes) {
    const f7Params = Utils.extend({}, params, { root: rootEl });
    if (routes && routes.length && !f7Params.routes) f7Params.routes = routes;

    f7.instance = new Framework7(f7Params);
    events.emit('ready', f7.instance);
  },
  ready(callback) {
    if (!callback) return;
    if (f7.instance) callback(f7.instance);
    else {
      events.once('ready', callback);
    }
  },
  routers,
  routableModals: null,
  events,
};

export default f7;
