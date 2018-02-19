import test from 'test';

function doSomething() {
  const foo = 'bar';
}

export default {
  name: 'my-button',
  props: {
    checked: Boolean,
    selected: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: 'Ta-Da!',
      required: true,
    },
    age: [String, Number, Array],
    date: {
      type: [String, Number, Date],
      required: true,
    },
    callback: Function,
    formData: window.FormData,
  },
  state(props, secondArgument) {
    const foo = props.checked ? 'bar-checked' : 'bar';

    return {
      foo,
      counter: 0,
      items: [],
    };
  },
  render() {
    return (
      <div className={{test: true}} data-id="2" checked onClick={this.onClick}><p>Hello {this.state.counter} times!</p></div>
    );
  },
  methods: {
    incremenent() {
      const self = this;
      self.setState({ counter: self.state.counter + 1 });
    },
    onClick(event) {
      const self = this;
      self.dispatchEvent('click', event);
    },
  },
  computed: {
    moreThanTwenty() {
      const self = this;
      return self.state.counter > 20;
    },
    moreThanTen() {
      const self = this;
      return self.state.counter > 10;
    },
  },
  componentWillCreate() {
    console.log('component is going to be created');
  },
  componentDidCreate() {
    console.log('component created');
  },
  componentWillMount() {
    console.log('component is going to be mounted');
  },
  componentDidMount() {
    console.log('component mounted');
  },
  componentWillUpdate() {
    console.log('component will update');
  },
  componentDidUpdate() {
    console.log('component updated');
  },
  componentWillUnmount() {
    console.log('component will unmount');
  },
};
