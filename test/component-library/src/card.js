import Utils from '../utils/utils';
import Mixins from '../utils/mixins';

import F7CardHeader from './card-header'; // @keep-import-path
import F7CardContent from './card-content'; // @keep-import-path
import F7CardFooter from './card-footer'; // @keep-import-path

const CardProps = Utils.extend(
  {
    title: [String, Number],
    content: [String, Number],
    footer: [String, Number],
    padding: {
      type: Boolean,
      default: true,
    },
  },
  Mixins.colorProps,
);

export default {
  name: 'f7-card',
  props: CardProps,
  render(c) {
    const self = this;
    let headerEl;
    let contentEl;
    let footerEl;

    if (self.title || (self.$slots && self.$slots.header)) {
      headerEl = (
        <F7CardHeader>
          {self.props.title}
          <slot name="header"></slot>
        </F7CardHeader>
      );
    }
    if (self.content || (self.$slots && self.$slots.content)) {
      contentEl = (
        <F7CardContent padding={this.props.padding}>
          {self.props.content}
          <slot name="content"></slot>
        </F7CardContent>
      );
    }
    if (self.footer || (self.$slots && self.$slots.footer)) {
      footerEl = (
        <F7CardFooter>
          {self.props.title}
          <slot name="footer"></slot>
        </F7CardFooter>
      );
    }

    return (
      <div className={this.classes}>
        {headerEl}
        {contentEl}
        {footerEl}
        <slot></slot>
      </div>
    )
  },
  computed: {
    classes() {
      const self = this;
      return Utils.extend({
        card: true,
      }, Mixins.colorClasses(self));
    },
  },
};
