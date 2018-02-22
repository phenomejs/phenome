let __vueComponentPropKeys;

function __getVueComponentPropKeys(props) {
  __vueComponentPropKeys = Object.keys(props);
  return props;
}

function __getVueComponentProps(component) {
  const props = {};

  __vueComponentPropKeys.forEach(propKey => {
    if (typeof component[propKey] !== 'undefined') props[propKey] = component[propKey];
  });

  const children = [];
  Object.keys(component.$slots).forEach(slotName => {
    children.push(...component.$slots[slotName]);
  });
  props.children = children;
  return props;
}

function __transformVueJSXProps(data) {
  if (!data) return data;
  if (!data.attrs) return data;
  Object.keys(data.attrs).forEach(key => {
    if (key === 'className') {
      data.class = data.attrs.className;
      delete data.attrs.className;
      return;
    }

    if (key.indexOf('-') >= 0) return;
    let newKey;
    let value = data.attrs[key];
    if (key === 'maxLength') newKey = 'maxlength';else if (key === 'tabIndex') newKey = 'tabindex';else {
      newKey = key.replace(/([A-Z])/g, function (v) {
        return '-' + v.toLowerCase();
      });
    }

    if (newKey !== key) {
      data.attrs[newKey] = value;
      delete data.attrs[key];
    }
  });
  return data;
}

function __getVueComponentSlot(self, name, defaultChildren) {
  if (self.$slots[name] && self.$slots[name].length) {
    return self.$slots[name];
  }

  return defaultChildren;
}

export default {
  name: 'my-component',
  props: __getVueComponentPropKeys({
    name: {
      type: String,
      default: 'World'
    },
    countFrom: Number,
    compiler: {
      type: String,
      required: true
    }
  }),

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
    return h("div", __transformVueJSXProps({
      ref: "main"
    }), [h("h2", __transformVueJSXProps({
      attrs: {
        className: "class-test",
        maxLength: "3",
        "data-id": "4",
        "data-tab-id": "5"
      }
    }), [this.props.compiler]), h("p", __transformVueJSXProps(null), ["Hello ", this.props.name, "! I've been clicked ", h("b", __transformVueJSXProps(null), [this.state.counter]), " times"]), h("p", __transformVueJSXProps(null), [__getVueComponentSlot(this, "before-button", ["No before button slot passed"]), h("button", __transformVueJSXProps({
      ref: "button",
      on: {
        "click": this.increment.bind(this)
      }
    }), ["Increment!"]), __getVueComponentSlot(this, "after-button", ["No after button slot passed"])]), h("p", __transformVueJSXProps(null), [h("button", __transformVueJSXProps({
      ref: "button",
      on: {
        "click": this.emitClick.bind(this)
      }
    }), ["Emit Click Event"]), " (check console)"]), h("p", __transformVueJSXProps(null), ["But time is ticking ", this.state.seconds]), __getVueComponentSlot(this, "default", ["No default slot passed"])]);
  },

  methods: {
    emitClick(event) {
      const self = this;
      console.log(self);
      window.comp = self;
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
    refs() {
      return this.$refs;
    },

    props() {
      return __getVueComponentProps(this);
    },

    children() {
      return this.$children;
    },

    parent() {
      return this.$parent;
    },

    el() {
      return this.$el;
    }

  }
};