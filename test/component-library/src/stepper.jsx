
import Utils from './utils/utils';
import Mixins from './utils/mixins';

const StepperProps = Utils.extend({
  init: {
    type: Boolean,
    default: true,
  },
  value: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  formatValue: Function,
  input: {
    type: Boolean,
    default: true,
  },
  inputType: {
    type: String,
    default: 'text',
  },
  inputReadonly: {
    type: Boolean,
    default: true,
  },
  autorepeat: {
    type: Boolean,
    default: false,
  },
  autorepeatDynamic: {
    type: Boolean,
    default: false,
  },
  wraps: {
    type: Boolean,
    default: false,
  },
  disabled: Boolean,
  buttonsOnly: Boolean,

  round: Boolean,
  roundMd: Boolean,
  roundIos: Boolean,
  fill: Boolean,
  fillMd: Boolean,
  fillIos: Boolean,
  big: Boolean,
  bigMd: Boolean,
  bigIos: Boolean,
  small: Boolean,
  smallMd: Boolean,
  smallIos: Boolean,
  raised: Boolean,
}, Mixins.colorProps);

export default {
  name: 'f7-stepper',
  props: StepperProps,
  render() {
    const self = this;
    const { input, buttonsOnly, inputType, value, inputReadonly } = self.props;

    let inputWrapEl;
    let valueEl;
    if (input && !buttonsOnly) {
      inputWrapEl = (
        <div className="stepper-input-wrap">
          <input
            type={inputType}
            min={inputType === 'number' ? min : undefined}
            max={inputType === 'number' ? max : undefined}
            step={inputType === 'number' ? step : undefined}
            value={value}
            readOnly={inputReadonly}
            onInput={self.onInput.bind(self)} />
        </div>
      );
    }
    if (!input && !buttonsOnly) {
      valueEl = (
        <div className="stepper-value">{value}</div>
      );
    }
    return (
      <div ref="el" id={self.props.id} style={self.props.style} className={self.classes}>
        <div className="stepper-button-minus" onClick={self.onMinusClick.bind(self)}></div>
        {inputWrapEl}
        {valueEl}
        <div className="stepper-button-plus" onClick={self.onPlusClick.bind(self)}></div>
      </div>
    );
  },
  computed: {
    classes() {
      const self = this;
      const {
        round,
        roundIos,
        roundMd,
        fill,
        fillIos,
        fillMd,
        big,
        bigIos,
        bigMd,
        small,
        smallIos,
        smallMd,
        raised,
        disabled,
      } = self.props;

      return Utils.classNames(
        self.props.className,
        'stepper',
        {
          disabled,
          'stepper-round': round,
          'stepper-round-ios': roundIos,
          'stepper-round-md': roundMd,
          'stepper-fill': fill,
          'stepper-fill-ios': fillIos,
          'stepper-fill-md': fillMd,
          'stepper-big': big,
          'stepper-big-ios': bigIos,
          'stepper-big-md': bigMd,
          'stepper-small': small,
          'stepper-small-ios': smallIos,
          'stepper-small-md': smallMd,
          'stepper-raised': raised,
        },
        Mixins.colorClasses(self),
      );
    },
  },
  componentWillUnmount() {
    if (!this.props.init) return;
    if (this.f7Stepper && this.f7Stepper.destroy) {
      this.f7Stepper.destroy();
    }
  },
  componentDidMount() {
    const self = this;
    if (!self.props.init) return;
    self.$f7ready((f7) => {
      const {
        min, max, value, step, formatValue, $el, autorepeat, autorepeatDynamic, wraps,
      } = self.props;
      self.f7Stepper = f7.stepper.create({
        el: $el,
        min,
        max,
        value,
        step,
        formatValue,
        autorepeat,
        autorepeatDynamic,
        wraps,
        on: {
          change(stepper, newValue) {
            self.dispatchEvent('stepper:change stepperChange', newValue);
          },
        },
      });
    });
  },
  methods: {
    increment() {
      if (!this.f7Stepper) return;
      this.f7Stepper.increment();
    },
    decrement() {
      if (!this.f7Stepper) return;
      this.f7Stepper.decrement();
    },
    setValue(newValue) {
      const self = this;
      if (self.f7Stepper && self.f7Stepper.setValue) self.f7Stepper.setValue(newValue);
    },
    getValue() {
      const self = this;
      if (self.f7Stepper && self.f7Stepper.getValue) {
        return self.f7Stepper.getValue();
      }
      return undefined;
    },
    onInput(e) {
      this.dispatchEvent('input', e, this.f7Stepper);
    },
    onMinusClick(e) {
      this.dispatchEvent('stepper:minusclick stepperMinusClick', e, this.f7Stepper);
    },
    onPlusClick(e) {
      this.dispatchEvent('stepper:plusclick stepperPlusClick', e, this.f7Stepper);
    },
  },
};
