# Vue

```html
<script>
  import Utils from '../utils/utils';
  import Mixins from '../utils/mixins';
  import f7Icon from './icon.vue';

  const ButtonProps = Utils.extend(
    {
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
    },
    Mixins.colorProps,
    Mixins.linkIconProps,
    Mixins.linkRouterProps,
    Mixins.linkActionsProps
  );

  export default {
    name: 'f7-button',
    components: {
      f7Icon,
    },
    props: ButtonProps,
    render(c) {
      const self = this;
      let iconEl;
      let textEl;
      if (self.text) {
        textEl = c('span', {}, self.text);
      }
      if (self.icon || self.iconMaterial || self.iconIon || self.iconFa || self.iconF7 || self.iconIfMd || self.iconIfIos) {
        iconEl = c('f7-icon', {
          props: {
            material: self.iconMaterial,
            ion: self.iconIon,
            fa: self.iconFa,
            f7: self.iconF7,
            icon: self.icon,
            ifMd: self.iconIfMd,
            ifIos: self.iconIfIos,
            color: self.iconColor,
            size: self.iconSize,
          },
        });
      }
      self.classes.button = true;
      const linkEl = c('a', {
        class: self.classes,
        attrs: self.attrs,
        on: {
          click: self.onClick,
        },
      }, [iconEl, textEl, self.$slots.default]);

      return linkEl;
    },
    computed: {
      attrs() {
        const self = this;
        const { href, target, tabLink } = self;
        return Utils.extend(
          {
            href,
            target,
            'data-tab': Utils.isStringProp(tabLink) && tabLink,
          },
          Mixins.linkRouterAttrs(self),
          Mixins.linkActionsAttrs(self)
        );
      },
      classes() {
        const self = this;
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
        } = self;

        return Utils.extend(
          {
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
          },
          Mixins.colorClasses(self),
          Mixins.linkRouterClasses(self),
          Mixins.linkActionsClasses(self)
        );
      },
    },
    methods: {
      onClick(event) {
        this.$emit('click', event);
      },
    },
  };
</script>
```

# React

```javascript
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Utils from '../utils/utils';
import Mixins from '../utils/mixins';
import f7Icon from './icon';

export class F7Button extends Component {
    render() {        
        let iconEl;
        let textEl;
        
        if (this.props.text) {
            textEl = <span>{this.props.text}</span>;
        }
    
        if (this.props.icon
            || this.props.iconMaterial
            || this.props.iconIon
            || this.props.iconFa
            || this.props.iconF7
            || this.props.iconIfMd
            || this.props.iconIfIos
        ) {
            iconEl = (
                <F7Icon
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
            <a onClick={this.onClick.bind(this)} {...this.attrs}>
                {[iconEl, textEl, <slot />]}
            </a>
        );
    
        return linkEl;
    }

    get attrs() {        
        const { href, target, tabLink } = this.props;
        
        return {
            href,
            target,
            'data-tab': Utils.isStringProp(tabLink) && tabLink,            
            ...Mixins.linkRouterAttrs(this),
            ...Mixins.linkActionsAttrs(this)
        };
    }

    get classes() {        
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
            ...Mixins.colorClasses(self),
            ...Mixins.linkRouterClasses(self),
            ...Mixins.linkActionsClasses(self)
        };   
    }

    onClick(event) {
        this.props.onClick(event);
    }
}

F7Button.propTypes = {
    noFastclick: PropTypes.bool,
    noFastClick: PropTypes.bool,
    text: PropTypes.string,
    tabLink: PropTypes.oneOfType([
        PropTypes.boolean,
        PropTypes.string
    ]),
    tabLinkActive: PropTypes.bool,
    href: PropTypes.string,
    round: PropTypes.bool,
    roundMd: PropTypes.bool,
    roundIos: PropTypes.bool,
    fill: PropTypes.bool,
    fillMd: PropTypes.bool,
    fillIos: PropTypes.bool,
    big: PropTypes.bool,
    bigMd: PropTypes.bool,
    bigIos: PropTypes.bool,
    small: PropTypes.bool,
    smallMd: PropTypes.bool,
    smallIos: PropTypes.bool,
    raised: PropTypes.bool,
    outline: PropTypes.bool,
    active: PropTypes.bool,
    ...Mixins.colorProps,
    ...Mixins.linkIconProps,
    ...Mixins.linkRouterProps,
    ...Mixins.linkActionsProps
};

F7Button.defaultProps = {
    href: '#'
}
```