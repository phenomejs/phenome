import Utils from './utils/utils';
import Mixins from './utils/mixins';
import F7Badge from './badge';
import F7Icon from './icon';

const LinkProps = Utils.extend(
  {
    noLinkClass: Boolean,
    noFastClick: Boolean,
    noFastclick: Boolean,
    text: String,
    tabLink: [Boolean, String],
    tabLinkActive: Boolean,
    tabbarLabel: Boolean,
    iconOnly: Boolean,
    badge: [String, Number],
    badgeColor: [String],
    iconBadge: [String, Number],
    href: {
      type: [String, Boolean],
      default: '#',
    },
  },
  Mixins.colorProps,
  Mixins.linkIconProps,
  Mixins.linkRouterProps,
  Mixins.linkActionsProps,
);

export default {
  name: 'f7-link',
  props: LinkProps,
  render() {
    const self = this;
    const props = self.props;
    const {
      tabbarLabel,
      tabLink,
      text,
      badge,
      badgeColor,
      iconOnly,
      iconBadge,
      icon,
      iconColor,
      iconSize,
      iconMaterial,
      iconIon,
      iconFa,
      iconF7,
      iconIfMd,
      iconIfIos,
      id,
      style,
    } = props;

    const defaultSlots = self.slots.default;
    const isTabbarLabel = false; // self.props.tabbarLabel || ((self.props.tabLink || self.props.tabLink === '') && self.$parent && self.$parent.tabbar && self.$parent.labels);

    let iconEl;
    let textEl;
    let badgeEl;
    let iconBadgeEl;

    if (text) {
      if (badge) badgeEl = (<F7Badge color={badgeColor}>{badge}</F7Badge>);
      textEl = (
        <span className={isTabbarLabel ? 'tabbar-label' : ''}>
          {text}
          {badgeEl}
        </span>
      )
    }
    if (icon || iconMaterial || iconIon || iconFa || iconF7 || (iconIfMd && self.$theme.md) || (iconIfIos && self.$theme.ios)) {
      if (iconBadge) {
        iconBadgeEl = <F7Badge color={badgeColor}>{iconBadge}</F7Badge>
      }
      iconEl = (
        <F7Icon
          material={iconMaterial}
          f7={iconF7}
          fa={iconFa}
          ion={iconIon}
          icon={icon}
          ifMd={iconIfMd}
          ifIos={iconIfIos}
          color={iconColor}
          size={iconSize}
        >{iconBadgeEl}</F7Icon>
      );
    }
    if (
      iconOnly ||
      (!text && defaultSlots && defaultSlots.length === 0) ||
      (!self.text && !defaultSlots)
    ) {
      self.iconOnlyComputed = true;
    } else {
      self.iconOnlyComputed = false;
    }

    return (
      <a
        id={id}
        style={style}
        className={self.classes}
        onClick={self.onClick.bind(self)}
        {...self.attrs}
      >
        {iconEl}
        {textEl}
        {defaultSlots}
      </a>
    );
  },
  computed: {
    attrs() {
      const self = this;
      const { href, target, tabLink } = self.props;
      let hrefComputed = href;
      if (href === true) hrefComputed = '#';
      if (href === false) hrefComputed = undefined; // no href attribute
      return Utils.extend(
        {
          href: hrefComputed,
          target,
          'data-tab': (Utils.isStringProp(tabLink) && tabLink) || undefined,
        },
        Mixins.linkRouterAttrs(self),
        Mixins.linkActionsAttrs(self),
      );
    },
    classes() {
      const self = this;
      const {
        noFastclick,
        noFastClick,
        tabLink,
        tabLinkActive,
        noLinkClass,
        className,
      } = self.props;

      return Utils.classNames(
        className,
        {
          link: !(noLinkClass || self.isTabbarLabel),
          'icon-only': self.iconOnlyComputed,
          'tab-link': tabLink || tabLink === '',
          'tab-link-active': tabLinkActive,
          'no-fastclick': noFastclick || noFastClick,
        },
        Mixins.colorClasses(self),
        Mixins.linkRouterClasses(self),
        Mixins.linkActionsClasses(self),
      );
    },
  },
  methods: {
    onClick(event) {
      this.dispatchEvent('click', event);
    },
  },
};
