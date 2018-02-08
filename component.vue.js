import test from 'test';

function doSomething() {
  const foo = 'bar';
}

function __getVueComponentProps(component) {
  const props = {};
  if (typeof component.checked !== 'undefined') props.checked = component.checked;
  if (typeof component.selected !== 'undefined') props.selected = component.selected;
  if (typeof component.title !== 'undefined') props.title = component.title;
  if (typeof component.age !== 'undefined') props.age = component.age;
  if (typeof component.date !== 'undefined') props.date = component.date;
  if (typeof component.callback !== 'undefined') props.callback = component.callback;
  if (typeof component.formData !== 'undefined') props.formData = component.formData;
  return props;
}

function __transformVueJSXProps(data) {
  return data;
}

export default {
  name: 'my-button',
  props: {
    checked: Boolean,
    selected: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: 'Ta-Da!',
      required: true
    },
    age: [String, Number, Array],
    date: {
      type: [String, Number, Date],
      required: true
    },
    callback: Function,
    formData: window.FormData
  },

  data(secondArgument) {
    const props = __getVueComponentProps(this);

    const state = (() => {
      const foo = props.checked ? 'bar-checked' : 'bar';
      return {
        foo,
        counter: 0,
        items: []
      };
    })();

    return {
      state
    };
  },

  render() {
    const h = arguments[0];
    return h("div", __transformVueJSXProps({
      "class": {
        test: true
      },
      attrs: {
        "data-id": "2",
        checked: true
      },
      on: {
        "click": this.onClick
      }
    }), [h("p", __transformVueJSXProps(null), ["Hello ", this.state.counter, " times!"])]);
  },

  methods: {
    incremenent() {
      const self = this;
      self.setState({
        counter: self.state.counter + 1
      });
    },

    onClick(event) {
      const self = this;
      self.dispatchEvent('click', event);
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
  computed: {
    moreThanTwenty() {
      const self = this;
      return self.state.counter > 20;
    },

    moreThanTen() {
      const self = this;
      return self.state.counter > 10;
    },

    props() {
      return __getVueComponentProps(this);
    }

  },

  beforeCreate() {
    console.log('component is going to be created');
  },

  created() {
    console.log('component created');
  },

  beforeMount() {
    console.log('component is going to be mounted');
  },

  mounted() {
    console.log('component mounted');
  },

  beforeUpdate() {
    console.log('component will update');
  },

  updated() {
    console.log('component updated');
  },

  beforeDestroy() {
    console.log('component will unmount');
  }

};