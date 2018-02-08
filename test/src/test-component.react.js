import React from 'react';
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
    return __c("div", null, __c("h2", null, this.props.compiler), __c("p", null, "Hello ", this.props.name, "! I've been clicked ", __c("b", null, this.state.counter), " times"), __c("p", null, __c("button", {
      onClick: this.increment.bind(this)
    }, "Increment!")), __c("p", null, __c("button", {
      onClick: this.emitClick.bind(this)
    }, "Emit Click Event"), " (check console)"), __c("p", null, "But time is ticking ", this.state.seconds));
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

const __c = (name, props, children) => {
  if (props) {
    Object.keys(props).forEach(propName => {
      let newPropName;

      if (propName === 'class') {
        newPropName = 'className';
      } else if (propName.substring(0, 3) !== 'data') {
        newPropName = propName.trim().split(/[-_:]/).map(word => word[0].toLowerCase() + word.substring(1)).join('');
      }

      if (propName !== newPropName) {
        props[newPropName] = props[propName];
        delete props[propName];
      }
    });
  }

  return React.createElement(name, props, children);
};