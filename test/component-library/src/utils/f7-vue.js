/* eslint no-param-reassign: "off" */
/* eslint no-underscore-dangle: "off" */
import Utils from './utils';
import VueRouter from './f7-vue-router';

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

    Vue.mixin({
      beforeCreate() {
        const self = this;

        let $route;
        let $router;
        let parent = self;
        while (parent && !$router && !$route) {
          if (parent.$f7route) $route = parent.$f7route;

          if (parent.$f7router) $router = parent.$f7router;
          else if (parent.f7View) {
            $router = parent.f7View.router;
          } else if (parent.$el && parent.$el.f7View) {
            $router = parent.$el.f7View.router;
          }
          parent = parent.$parent;
        }
        if ($route && $router) {
          self.$f7route = $route;
          self.$f7router = $router;
          self.$f7Route = $route;
          self.$f7Router = $router;
        }
      },
    });

    // Extend F7 Router
    Framework7.Router.use(VueRouter);
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
      events.on('ready', () => {
        callback(f7.instance);
      });
    }
  },
  routers,
  routableModals: null,
  events,
};

export default f7;
