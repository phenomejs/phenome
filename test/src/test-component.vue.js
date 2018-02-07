export default {
  name: 'my-component',
  props: {
    name: {
      type: String,
      default: 'World'
    },
    countFrom: Number,
    compiler: {
      type: String,
      required: true
    }
  },

  data() {
    const props = this;
    return {
      counter: props.countFrom || 0,
      seconds: 0
    };
  },

  render() {
    const h = arguments[0];
    return h("div", null, [h("h2", null, [this.props.compiler]), h("p", null, ["Hello ", this.props.name, "! I've been clicked ", h("b", null, [this.state.counter]), " times"]), h("p", null, [h("button", {
      on: {
        "click": this.increment.bind(this)
      }
    }, ["Increment!"])]), h("p", null, [h("button", {
      on: {
        "click": this.emitClick.bind(this)
      }
    }, ["Emit Click Event"]), " (check console)"]), h("p", null, ["But time is ticking ", this.state.seconds])]);
  },

  methods: {
    emitClick(event) {
      const self = this;
      self.dispatchEvent('click', event);
    },

    tick() {
      const self = this;
      self.setState({
        seconds: self.state.seconds += 1
      });
    },

    increment() {
      const self = this;
      self.setState({
        counter: self.state.counter += 1
      });
    },

    forceUpdate() {
      const self = this;
      self.$forceUpdate();
    },

    dispatchEvent(event, ...args) {
      const self = this;
      self.$emit(event, ...args);
    },

    setState(updater, callback) {
      const self = this;
      let newState;

      if (typeof updater === 'function') {
        newState = updater(self.state, self.props);
      } else {
        newState = updater;
      }

      Object.keys(newState).forEach(key => {
        self.$set(self, key, newState[key]);
      });
      if (typeof callback === 'function') callback();
    }

  },

  mounted() {
    setInterval(() => {
      this.tick();
    }, 1000);
  },

  computed: {
    props() {
      return this;
    },

    state() {
      return this;
    }

  }
};