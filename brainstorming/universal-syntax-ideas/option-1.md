# F7 Badge

```javascript
import { Component } from 'universal-component';

const options = {
    name: 'f7-badge',
    props: {
        ...Mixins.colorProps
    }
};

export default Component(options, props => (
    <span class={['badge', {...Mixins.colorClasses(props)}]}>
        <slot />
    </span>
));
```

# F7 Button

```javascript
import { Component } from 'universal-component';

@Component({
    name: 'f7-button',
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
        ...Mixins.linkActionsProps        
    }
})
export default class {
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
            <a onClick={this.onClick.bind(this)} {...this.attrs} class={{ ...this.classes, button: true }}>
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
        this.$emit('click', event);
    }    
}
```