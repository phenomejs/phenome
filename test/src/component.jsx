export default {
  name: 'my-phenome-component',
  props: {
    foo: String,
    bar: Number,
    fooBar: [String, Number],
  },
  render() {
    return (
      <div className="test-component" />
    );
  },
}