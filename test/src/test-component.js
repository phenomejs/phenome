export default {
  name: 'my-component',
  props: {
    name: {
      type: String,
      default: 'World',
    },
    countFrom: Number,
    compiler: {
      type: String,
      required: true,
    },
  },
  state(props) {
    return {
      counter: props.countFrom || 0,
      seconds: 0,
    };
  },
  render() {
    return (
      <div>
        <h2 className="class-test" maxLength="3" data-id="4" data-tab-id="5">{this.props.compiler}</h2>
        <p>Hello {this.props.name}! I've been clicked <b>{this.state.counter}</b> times</p>
        <p>
          <slot name="before-button">No before button slot passed</slot>
          <button onClick={this.increment.bind(this)}>Increment!</button>
          <slot name="after-button">No after button slot passed</slot>
        </p>
        <p><button onClick={this.emitClick.bind(this)}>Emit Click Event</button> (check console)</p>
        <p>But time is ticking {this.state.seconds}</p>
        <slot>No default slot passed</slot>
      </div>
    )
  },
  methods: {
    emitClick(event) {
      const self = this;
      self.dispatchEvent('click', event);
    },
    tick() {
      const self = this;
      self.setState({ seconds: self.state.seconds += 1 });
    },
    increment() {
      const self = this;
      self.setState({ counter: self.state.counter += 1 });
    },
  },
  componentDidMount() {
    setInterval(() => {
      this.tick()
    }, 1000);
  },
};
