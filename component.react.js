import React from 'react';
import PropTypes from 'prop-types';
import test from 'test';

function doSomething() {
  const foo = 'bar';
}

class MyButton extends React.Component {
  constructor(props) {
    super(props);

    (() => {
      console.log('component is going to be created');
    })();

    this.state = (() => {
      const foo = props.checked ? 'bar-checked' : 'bar';
      return {
        foo,
        counter: 0,
        items: []
      };
    })();

    (() => {
      console.log('component created');
    })();
  }

  dispatchEvent(event, ...args) {
    const self = this;
    if (!event || !event.trim.length) return;
    const eventName = (event || '').trim().split(/[ -_:]/).map(word => word[0].toUpperCase() + word.substring(1)).join('');
    const propName = 'on' + eventName;
    if (self.props[propName]) self.props[propName](...args);
  }

  render() {
    return React.createElement("div", {
      "class": {
        test: true
      },
      "data-id": "2",
      checked: true,
      onClick: this.onClick
    }, React.createElement("p", null, "Hello ", this.state.counter, " times!"));
  }

  incremenent() {
    const self = this;
    self.setState({
      counter: self.state.counter + 1
    });
  }

  onClick(event) {
    const self = this;
    self.dispatchEvent('click', event);
  }

  get moreThanTwenty() {
    const self = this;
    return self.state.counter > 20;
  }

  get moreThanTen() {
    const self = this;
    return self.state.counter > 10;
  }

  componentWillMount() {
    console.log('component is going to be mounted');
  }

  componentDidMount() {
    console.log('component mounted');
  }

  componentWillUpdate() {
    console.log('component will update');
  }

  componentDidUpdate() {
    console.log('component updated');
  }

  componentWillUnmount() {
    console.log('component will unmount');
  }

}

MyButton.defaultProps = {
  selected: true,
  title: 'Ta-Da!'
};
MyButton.propTypes = {
  checked: PropTypes.bool,
  selected: PropTypes.bool,
  title: PropTypes.string.isRequired,
  age: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
  callback: PropTypes.func,
  formData: PropTypes.instanceOf(window.FormData)
};

export default MyButton;