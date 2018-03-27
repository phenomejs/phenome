export default (self, name, defaultChildren) => {
  if (!self.props.children) {
    return defaultChildren;
  }

  if (Array.isArray(self.props.children)) {
    const slotChildren = [];
    self.props.children.forEach((child) => {
      const slotName = child.props && child.props.slot || 'default';
      if (slotName === name) {
        slotChildren.push(child);
      }
    });

    if (slotChildren.length === 1) return slotChildren[0];
    if (slotChildren.length > 1) return slotChildren;
  } else if (self.props.children.props && self.props.children.props.slot === name) {
    return self.props.children;
  } else if (self.props.children.props && !self.props.children.props.slot && name === 'default') {
    return self.props.children;
  } else if (typeof self.props.children === 'string' && name === 'default') {
    return self.props.children;
  }

  return defaultChildren;
};
