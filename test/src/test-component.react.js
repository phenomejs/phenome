import React from 'react';

function __transformReactJSXProps(props) {
  if (props) {
    Object.keys(props).forEach(propName => {
      let newPropName;

      if (propName === 'class') {
        newPropName = 'className';
      } else if (propName.substring(0, 4) !== 'data') {
        newPropName = propName.trim().split(/[-_:]/).map(word => word[0].toLowerCase() + word.substring(1)).join('');
      } else {
        newPropName = propName;
      }

      if (propName !== newPropName) {
        props[newPropName] = props[propName];
        delete props[propName];
      }
    });
  }

  return props;
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

  render() {
    return React.createElement("div", __transformReactJSXProps(null), React.createElement("h2", __transformReactJSXProps({
      className: "class-test",
      maxLength: "3",
      "data-id": "4",
      "data-tab-id": "5"
    }), this.props.compiler), React.createElement("p", __transformReactJSXProps(null), "Hello ", this.props.name, "! I've been clicked ", React.createElement("b", __transformReactJSXProps(null), this.state.counter), " times"), React.createElement("p", __transformReactJSXProps(null), React.createElement("button", __transformReactJSXProps({
      onClick: this.increment.bind(this)
    }), "Increment!")), React.createElement("p", __transformReactJSXProps(null), React.createElement("button", __transformReactJSXProps({
      onClick: this.emitClick.bind(this)
    }), "Emit Click Event"), " (check console)"), React.createElement("p", __transformReactJSXProps(null), "But time is ticking ", this.state.seconds));
  }

  emitClick(event) {
    const self = this;
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