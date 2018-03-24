import Utils from '../utils/utils';
import Mixins from '../utils/mixins';

const BlockProps = Utils.extend(
  {
    inset: Boolean,
    tabletInset: Boolean,
    strong: Boolean,
    tabs: Boolean,
    tab: Boolean,
    tabActive: Boolean,
    accordionList: Boolean,
    noHairlines: Boolean,
    noHairlinesMd: Boolean,
    noHairlinesIos: Boolean,
  },
  Mixins.colorProps,
);

export default {
  name: 'f7-block',
  props: BlockProps,
  render() {
    return (
      <div
        id={this.props.id}
        style={this.props.style}
        className={this.classes}
        onTabShow={this.onTabShow.bind(this)}
        onTabHide={this.onTabHide.bind(this)}
      >
        <slot></slot>
      </div>
    );
  },
  computed: {
    classes() {
      const self = this;
      return Utils.classNames(
        self.props.className,
        {
          block: true,
          inset: self.props.inset,
          'block-strong': self.props.strong,
          'accordion-list': self.props.accordionList,
          'tablet-inset': self.props.tabletInset,
          tabs: self.props.tabs,
          tab: self.props.tab,
          'tab-active': self.props.tabActive,
          'no-hairlines': self.props.noHairlines,
          'no-hairlines-md': self.props.noHairlinesMd,
          'no-hairlines-ios': self.props.noHairlinesIos,
        },
        Mixins.colorClasses(self),
      );
    },
  },
  methods: {
    onTabShow(e) {
      this.dispatchEvent('tab:show', e);
    },
    onTabHide(e) {
      this.dispatchEvent('tab:hide', e);
    },
  },
};
