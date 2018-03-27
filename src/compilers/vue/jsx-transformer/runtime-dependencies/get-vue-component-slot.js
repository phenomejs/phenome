export default (self, name, defaultChildren) => {
  if (self.$slots[name] && self.$slots[name].length) {
    return self.$slots[name];
  }

  return defaultChildren;
};
