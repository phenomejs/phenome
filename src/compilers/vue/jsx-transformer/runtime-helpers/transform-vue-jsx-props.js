export default (data) => {
  if (!data) return data;
  const nestedPropsKeys = ('style class domProps slot key ref').split(' ');
  Object.keys(data).forEach((key) => {
    if (key === 'className') {
      data.class = data.className;
      delete data.className;
      return;
    } else if (key === 'dangerouslySetInnerHTML') {
      if (!data.domProps) data.domProps = {};
      data.domProps.innerHTML = data[key];
      delete data.dangerouslySetInnerHTML;
      return;
    } else if (key.match(/^on?([A-Z])/)) {
      if (!data.on) data.on = {};
      const newKey = key.replace(/(^on?)([A-Z])/, (found, first, second) => second.toLowerCase());
      data.on[newKey] = data[key];
      delete data.key;
      return;
    }
    if (nestedPropsKeys.indexOf(key) >= 0) {
      return;
    }
    if (!data.attrs) {
      data.attrs = {};
    }
    if (!data.attrs[key]) {
      data.attrs[key] = data[key];
      delete data.key;
    }
  });

  return data;
};
