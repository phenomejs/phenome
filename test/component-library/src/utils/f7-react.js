/* eslint no-param-reassign: "off" */
/* eslint no-underscore-dangle: "off" */
import Utils from './utils';
import ComponentsRouter from './f7-components-router';

import routers from './routers';
import events from './events';

const f7 = {
  instance: undefined,
  install(Framework7, React, params = {}) {
    // Check for F7
    if (typeof Framework7 === 'undefined') {
      throw new Error('Framework7 is undefined, make sure you have passed it under "framework7" prop to <f7-app> component');
    }
    if (typeof React === 'undefined') {
      throw new Error('React is undefined, make sure you have passed it under "react" prop to <f7-app> component');
    }
    // Define protos
    Object.defineProperty(React.Component.prototype, '$f7', {
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
    Object.defineProperty(React.Component.prototype, '$theme', {
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
    React.Component.prototype.Dom7 = Framework7.$;
    React.Component.prototype.$$ = Framework7.$;
    React.Component.prototype.$device = Framework7.device;
    React.Component.prototype.$request = Framework7.request;
    React.Component.prototype.$utils = Framework7.utils;
    React.Component.prototype.$f7ready = f7ready;
    React.Component.prototype.$f7Ready = f7ready;

    Object.defineProperty(React.Component.prototype, '$f7route', {
      get() {
        const self = this;
        let route;
        let parent = self;
        if (self._f7route) route = self._f7route;
        while (parent && !route) {
          if (parent._f7route) route = parent._f7route;
          parent = parent._reactInternalFiber._debugOwner.stateNode;
        }
        return route;
      },
      set(value) {
        const self = this;
        self._f7route = value;
      },
    });
    Object.defineProperty(React.Component.prototype, '$f7router', {
      get() {
        const self = this;
        let router;
        let parent = self;
        if (self._f7router) router = self._f7router;
        while (parent && !router) {
          if (parent._f7router) router = parent._f7router;
          else if (parent.f7View) {
            router = parent.f7View.router;
          } else if (parent.refs && parent.refs.el && parent.refs.el.f7View) {
            router = parent.refs.el.f7View.router;
          }
          parent = parent._reactInternalFiber._debugOwner.stateNode;
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
