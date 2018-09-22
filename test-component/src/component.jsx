import Mixins from './mixins';
/* phenome-dts-imports
import Something from 'somewhere';
*/
/* phenome-react-dts-imports
import SomethingReact from 'somewhere-react';
*/
const moreProps = {
  moreFoo: String,
};
const deepProps = {
  moreDeepProps: {
    eventMoreDeepProps: {
      superDeepFoo: String,
    },
  }
}

/* phenome-dts-instance
  instanceFoo: String
  instanceFoo2: String
*/

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
    date: Date,
    ...moreProps,
    ...deepProps.moreDeepProps.eventMoreDeepProps,
    ...Mixins.colorProps,
    /* phenome-dts-props
    fooDts: string
    fooDts2: string
    */
    /* phenome-react-dts-props
    reactFoo: string
    */
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