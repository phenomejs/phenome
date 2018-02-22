import React from 'react';

function __transformReactJSXProps(props) {
  if (!props) return props;
  Object.keys(props).forEach(propName => {
    let newPropName;

    if (propName === 'class') {
      newPropName = 'className';
    } else {
      newPropName = propName;
    }

    if (propName !== newPropName) {
      props[newPropName] = props[propName];
      delete props[propName];
    }
  });
  return props;
}

function __getReactComponentSlot(self, name, defaultChildren) {
  if (!self.props.children) {
    return defaultChildren;
  }

  let slotChildren;

  if (Array.isArray(self.props.children)) {
    slotChildren = [];
    self.props.children.forEach(child => {
      const slotName = child.props.slot || 'default';

      if (slotName === name) {
        slotChildren.push(child);
      }
    });
    if (slotChildren.length === 1) return slotChildren[0];
    if (slotChildren.length > 1) return slotChildren;
  } else if (self.props.children.props && self.props.children.props.slot === name) {
    return self.props.children;
  } else if (self.props.children.props && !self.props.children.props.slot && name === 'default') {
    return self.props.children;
  }

  return defaultChildren;
}

import PropTypes from 'prop-types';

class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = (() => {
      return {
        counter: props.countFrom || 0,
        seconds: 0
      };
    })();
  }

  dispatchEvent(event, ...args) {
    const self = this;
    if (!event || !event.trim().length) return;
    const eventName = (event || '').trim().split(/[ -_:]/).map(word => word[0].toUpperCase() + word.substring(1)).join('');
    const propName = 'on' + eventName;
    if (self.props[propName]) self.props[propName](...args);
  }

  get children() {
    const self = this;
    const children = [];
    let child = self._reactInternalFiber && self._reactInternalFiber.child;

    function findChildren(node) {
      if (node.type && typeof node.type === 'function') {
        children.push(node.stateNode);
      } else if (node.child) {
        findChildren(node.child);
      }

      if (node.sibling) findChildren(node.sibling);
    }

    if (child) findChildren(child);
    return children;
  }

  get parent() {
    const self = this;
    const el = self.el;
    let parent;
    let reactProp;

    function checkParentNode(node) {
      if (!node) return;

      if (!reactProp) {
        for (let propName in node) {
          if (propName.indexOf('__reactInternalInstance') >= 0) reactProp = propName;
        }
      }

      if (node[reactProp] && node[reactProp]._debugOwner && typeof node[reactProp]._debugOwner.type === 'function' && node[reactProp]._debugOwner.stateNode && node[reactProp]._debugOwner.stateNode !== self) {
        parent = node[reactProp]._debugOwner.stateNode;
        return;
      }

      checkParentNode(node.parentNode);
    }

    if (self._reactInternalFiber._debugOwner) return self._reactInternalFiber._debugOwner.stateNode;else if (el) checkParentNode(el);
    return parent;
  }

  get el() {
    const self = this;
    let el;
    let child = self._reactInternalFiber.child;

    while (!el && child) {
      if (child.stateNode && child.stateNode instanceof window.HTMLElement) {
        el = child.stateNode;
      } else {
        child = child.child;
      }
    }

    return el;
  }

  render() {
    return React.createElement("div", __transformReactJSXProps({
      ref: "main"
    }), React.createElement("h2", __transformReactJSXProps({
      className: "class-test",
      maxLength: "3",
      "data-id": "4",
      "data-tab-id": "5"
    }), this.props.compiler), React.createElement("p", __transformReactJSXProps(null), "Hello ", this.props.name, "! I've been clicked ", React.createElement("b", __transformReactJSXProps(null), this.state.counter), " times"), React.createElement("p", __transformReactJSXProps(null), __getReactComponentSlot(this, "before-button", "No before button slot passed"), React.createElement("button", __transformReactJSXProps({
      ref: "button",
      onClick: this.increment.bind(this)
    }), "Increment!"), __getReactComponentSlot(this, "after-button", "No after button slot passed")), React.createElement("p", __transformReactJSXProps(null), React.createElement("button", __transformReactJSXProps({
      ref: "button",
      onClick: this.emitClick.bind(this)
    }), "Emit Click Event"), " (check console)"), React.createElement("p", __transformReactJSXProps(null), "But time is ticking ", this.state.seconds), __getReactComponentSlot(this, "default", "No default slot passed"));
  }

  emitClick(event) {
    const self = this;
    console.log(self);
    window.comp = self;
    self.dispatchEvent('click', event);
  }

  tick() {
    const self = this;
    self.setState({
      seconds: self.state.seconds += 1
    });
  }

  increment() {
    const self = this;
    self.setState({
      counter: self.state.counter += 1
    });
  }

  componentDidMount() {
    setInterval(() => {
      this.tick();
    }, 1000);
  }

}

MyComponent.defaultProps = {
  name: 'World'
};
MyComponent.propTypes = {
  name: PropTypes.string,
  countFrom: PropTypes.number,
  compiler: PropTypes.string.isRequired
};

export default MyComponent;