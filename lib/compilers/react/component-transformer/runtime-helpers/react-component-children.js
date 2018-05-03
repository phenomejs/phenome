export default function (component) {
  const self = component;
  const children = [];
  const child = self._reactInternalFiber && self._reactInternalFiber.child;
  function findChildren(node) {
    if (node.type && typeof node.type === 'function') {
      children.push(node.stateNode);
    } else if (node.child) {
      findChildren(node.child);
    }
    if (node.sibling) findChildren(node.sibling);
  }
  if (child) findChildren(child);
  return children;
}
