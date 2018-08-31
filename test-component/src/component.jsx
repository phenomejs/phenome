export default {
  name: 'my-phenome-component',
  props: {
    foo: String,
    bar: Number,
    fooBar: [String, Number],
    one: {
      type: Array,
      default: [0, 1, 2],
      required: true,
    },
    two: window.FormData,
    dt: Date,
    ...Mixins.colorProps,
  },
  methods: {
    open(animate = true) {
      this.dispatchEvent('componentOpen', 'foo')
    },
    close(animate) {
      this.dispatchEvent('componentClose', 'bar')
    },
  },
  render() {
    return (
      <div className="test-component">
        {/* Hello */}
      </div>
    );
  },
}