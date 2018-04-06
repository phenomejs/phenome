export default function (component, events, ...args) {
  const self = component;

  if (!events || !events.trim().length || typeof events !== 'string') return;

  events.trim().split(' ').forEach((event) => {
    const eventName = (event || '')
      .trim()
      .split(/[ -_:]/)
      .map(word => word[0].toUpperCase() + word.substring(1))
      .join('');

    const propName = `on${eventName}`;

    if (self.props[propName]) self.props[propName](...args);
  });
}
