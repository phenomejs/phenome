export default function (component) {
  const self = component;
  const el = self.el;
  let parent;
  let reactProp;
  function checkParentNode(node) {
    if (!node) return;
    if (!reactProp) {
      for (let propName in node) {
        if (propName.indexOf('__reactInternalInstance') >= 0) reactProp = propName;
      }
    }
    if (
      node[reactProp] &&
      node[reactProp]._debugOwner &&
      typeof node[reactProp]._debugOwner.type === 'function' &&
      node[reactProp]._debugOwner.stateNode &&
      node[reactProp]._debugOwner.stateNode !== self
    ) {
      parent = node[reactProp]._debugOwner.stateNode;
      return;
    }

    checkParentNode(node.parentNode);
  }

  if (self._reactInternalFiber._debugOwner) {
    return self._reactInternalFiber._debugOwner.stateNode;
  } else if (el) {
    checkParentNode(el);
  }

  return parent;
}
