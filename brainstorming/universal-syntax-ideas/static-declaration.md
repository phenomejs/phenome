# Static Declaration

One more option is to use static object declaration. Because Vue as component declaration actually uses same static object "props" object, on other hand React and WebComponent use JavaScript classes. So i can assume and option to use static declaration which is probably will be easier to process with compiler with output to both static and class

## F7 Badge

```js
import Mixins from '...';

export default {
  name: 'f7-badge', // we probably don't need name at all. Maybe later for auto-registration option
  props: {
    ...Mixins.colorProps
  },
  render() {
    // we can definitely go with JSX as both Vue & React support it
    return (
      <span class={['badge', {...Mixins.colorClasses(this.props)}]}>
        <slot></slot>
      </span>
    )
  },
}
```

## F7 Button
```js
import Mixins from '...';
import F7Icon from 'f7-icon-universal';

export default {
  name: 'f7-button',
  // see my notes about F7Icon in render function
  components: {
    'f7-icon': F7Icon,
  },
  props: {
    noFastclick: Boolean,
    noFastClick: Boolean,
    text: String,
    tabLink: [Boolean, String],
    tabLinkActive: Boolean,
    href: {
      type: String,
      default: '#',
    },
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
    outline: Boolean,
    active: Boolean,
    ...Mixins.colorProps,
    ...Mixins.linkIconProps,
    ...Mixins.linkRouterProps,
    ...Mixins.linkActionsProps,
  },
  render() {
    let iconEl;
    let textEl;

    if (this.props.text) {
      textEl = (<span>{this.props.text}</span>);
    }

    if (this.props.icon
      || this.props.iconMaterial
      || this.props.iconIon
      || this.props.iconFa
      || this.props.iconF7
      || this.props.iconIfMd
      || this.props.iconIfIos
    ) {
      /*
        Ok, but what is the <F7Icon> here?
        Is it supposed to be a universal component as well? Or we assume that we have registered Vue/React component here?
        I suggest to use lowercase-dash syntax for custom components, as it is also required for web components, and it won't be hard to change it to camelCase during compilation for React
      */
      iconEl = (
        <f7-icon
          material={this.props.iconMaterial}
          ion={this.props.iconIon}
          fa={this.props.iconFa}
          f7={this.props.iconF7}
          icon={this.props.icon}
          ifMd={this.props.iconIfMd}
          ifIos={this.props.iconIfIos}
          color={this.props.iconColor}
          size={this.props.iconSize}
        />
      );
    }

    const linkEl = (
      <a onClick={this.onClick.bind(this)} {...this.attrs} class={{ ...this.classes, button: true }}>
        {[iconEl, textEl, <slot></slot>]}
      </a>
    );

    return linkEl;
  },
  /*
    In terms of compilation we can place computed props to computed object as Vue has. And:
    - in case of -> Vue: we just keep it as it is
    - in case of -> React: we just move theme under instance methods with getters "computed.attrs -> get attrs()"
  */
  computed: {
    attrs() {
      const { href, target, tabLink } = this.props;

      return {
        href,
        target,
        'data-tab': Utils.isStringProp(tabLink) && tabLink,
        ...Mixins.linkRouterAttrs(this.props),
        ...Mixins.linkActionsAttrs(this.props)
      };
    },
    classes() {
      const {
        noFastclick,
        noFastClick,
        tabLink,
        tabLinkActive,
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
        active,
        outline,
      } = this.props;

      return {
        'tab-link': tabLink || tabLink === '',
        'tab-link-active': tabLinkActive,
        'no-fastclick': noFastclick || noFastClick,
        'button-round': round,
        'button-round-ios': roundIos,
        'button-round-md': roundMd,
        'button-fill': fill,
        'button-fill-ios': fillIos,
        'button-fill-md': fillMd,
        'button-big': big,
        'button-big-ios': bigIos,
        'button-big-md': bigMd,
        'button-small': small,
        'button-small-ios': smallIos,
        'button-small-md': smallMd,
        'button-raised': raised,
        'button-active': active,
        'button-outline': outline,
        ...Mixins.colorClasses(this.props),
        ...Mixins.linkRouterClasses(this.props),
        ...Mixins.linkActionsClasses(this.props)
      };
    }
  },
  /*
  Methods. We can keep it under main object declaration or move it under "methods" prop. In case we move it under "methods", then:
    - for Vue we keept it as it is
    - for React we move it under component class methods (prototype)
  In case we keep it under same level:
   - for Vue we move it under "methods"
   - for React we keep it as it is
  */
  methods: {
    onClick(event) {
      /* so we have two different syntax here
      Vue: this.$emit('click', event);
      React: this.props.onClick(event);
      
      I want to suggest to go here with camelCase because:
      - React uses camelCase for props
      - Much easier to convert to lowercase for Vue
      
      We can change $emit to something more generic
      */
      this.$dispatchEvent('click', event);
    }
  }
}
```

## Lifecycle Hooks

Vue/React/Web components has similar lifecycle methods

|Vue|React|Web Component|Universal|
| --- | --- | --- | --- |
| beforeCreate | constructor | constructor | * |
| created | - | - | * |
| beforeMount | componentWillMount | - | * |
| mounted | componentDidMount | connectedCallback | * |
| - | componentWillReceiveProps | attributeChangedCallback | * |
| beforeUpdate | componentWillUpdate | - | * |
| updated | componentDidUpdate | - | * |
| activated | - | - | * |
| deactivated | - | - | * |
| beforeDestroy | componentWillUnmount | - | * |
| destroyed | - | disconnectedCallback | * |
| errorCaptured | componentDidCatch | - | * |

## State

As i understood setting initial state in React is done via `this.state = {}` in component `constructor`. In Vue it is `data()`

```js
// Vue
{
  data() {
    return {
      color: 'red',
      size: 'big',
      clicks: 10,
    }
  },
  methods() {
    onClick() {
      this.clicks = this.clicks + 1;
    }
  }
}

//React
{
  constructor(props) {
    super(props);
    this.state = {
      color: 'red',
      size: 'big',
      clicks: 10,
    }
  },
  onClick() {
    this.setState(Object.assign({}, this.state, {this.state.clicks + 1}));
  },
}
```

So we need to comeup here with something common or to pick the one from React or from Vue. Just need to think which one will easier to compile to another one


## Element Reference

This is not pretty clear for me how to do it in React
