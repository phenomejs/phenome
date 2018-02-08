function __getVueComponentProps(component) {
  const props = {};
  if (typeof component.name !== 'undefined') props.name = component.name;
  if (typeof component.countFrom !== 'undefined') props.countFrom = component.countFrom;
  if (typeof component.compiler !== 'undefined') props.compiler = component.compiler;
  return props;
}

function __transformVueJSXProps(data) {
  return data;
}

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
    const props = __getVueComponentProps(this);

    const state = (() => {
      return {
        counter: props.countFrom || 0,
        seconds: 0
      };
    })();

    return {
      state
    };
  },

  render() {
    const h = arguments[0];
    return h("div", __transformVueJSXProps(null), [h("h2", __transformVueJSXProps({
      attrs: {
        className: "class-test",
        maxLength: "3",
        "data-id": "4",
        "data-tab-id": "5"
      }
    }), [this.props.compiler]), h("p", __transformVueJSXProps(null), ["Hello ", this.props.name, "! I've been clicked ", h("b", __transformVueJSXProps(null), [this.state.counter]), " times"]), h("p", __transformVueJSXProps(null), [h("button", __transformVueJSXProps({
      on: {
        "click": this.increment.bind(this)
      }
    }), ["Increment!"])]), h("p", __transformVueJSXProps(null), [h("button", __transformVueJSXProps({
      on: {
        "click": this.emitClick.bind(this)
      }
    }), ["Emit Click Event"]), " (check console)"]), h("p", __transformVueJSXProps(null), ["But time is ticking ", this.state.seconds])]);
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
        self.$set(self.state, key, newState[key]);
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
      return __getVueComponentProps(this);
    }

  }
};