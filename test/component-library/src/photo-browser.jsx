import Utils from './utils/utils';

export default {
  name: 'f7-photo-browser',
  props: {
    init: {
      type: Boolean,
      default: true,
    },
    params: Object,
    photos: Array,
    exposition: Boolean,
    expositionHideCaptions: Boolean,
    type: String,
    navbar: Boolean,
    toolbar: Boolean,
    theme: String,
    captionsTheme: String,
    swipeToClose: Boolean,
    backLinkText: String,
    navbarOfText: String,
    iconsColor: String,
    swiper: Object,
    url: String,
    view: [String, Object],
    routableModals: Boolean,
    renderNavbar: Function,
    renderToolbar: Function,
    renderCaption: Function,
    renderObject: Function,
    renderLazyPhoto: Function,
    renderPhoto: Function,
    renderPage: Function,
    renderPopup: Function,
    renderStandalone: Function,
  },
  render() {},
  watch: {
    'props.photos': function watchPhotos(newValue) {
      const self = this;
      const pb = self.f7PhotoBrowser;
      if (!pb) return;
      self.f7PhotoBrowser.photos = newValue;
      if (pb.opened && pb.swiper) {
        pb.swiper.update();
      }
    },
  },
  componentWillUnmount() {
    const self = this;
    if (self.f7PhotoBrowser && self.f7PhotoBrowser.destroy) self.f7PhotoBrowser.destroy();
  },
  componentDidMount() {
    const self = this;
    // Init Virtual List
    if (!self.props.init) return;
    self.$f7ready((f7) => {
      let params;

      if (typeof self.props.params !== 'undefined') params = self.props.params;
      else params = { ...self.props };

      Object.keys(params).forEach((param) => {
        if (typeof params[param] === 'undefined' || params[param] === '') delete params[param];
      });

      params = Utils.extend({}, params, {
        on: {
          open() {
            self.dispatchEvent('photobrowser:open photoBrowserOpen');
          },
          close() {
            self.dispatchEvent('photobrowser:close photoBrowserClose');
          },
          opened() {
            self.dispatchEvent('photobrowser:opened photoBrowserOpened');
          },
          closed() {
            self.dispatchEvent('photobrowser:closed photoBrowserClosed');
          },
          swipeToClose() {
            self.dispatchEvent('photobrowser:swipetoclose photoBrowserSwipeToClose');
          },
        },
      });

      self.f7PhotoBrowser = f7.photoBrowser.create(params);
    });
  },
  methods: {
    open(index) {
      return this.f7PhotoBrowser.open(index);
    },
    close() {
      return this.f7PhotoBrowser.close();
    },
    expositionToggle() {
      return this.f7PhotoBrowser.expositionToggle();
    },
    expositionEnable() {
      return this.f7PhotoBrowser.expositionEnable();
    },
    expositionDisable() {
      return this.f7PhotoBrowser.expositionDisable();
    },
  },
};
