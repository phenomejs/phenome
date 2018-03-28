export default (data) => {
  if (!data) return data;
  if (!data.attrs) return data;

  Object.keys(data.attrs).forEach((key) => {
    if (key === 'className') {
      data.class = data.attrs.className;
      delete data.attrs.className;
      return;
    }
    if (key.indexOf('-') >= 0) return;

    let newKey;
    let value = data.attrs[key];
    if (key === 'maxLength') newKey = 'maxlength';
    else if (key === 'tabIndex') newKey = 'tabindex';
    else {
      newKey = key.replace(/([A-Z])/g, v => `-${v.toLowerCase()}`);
    }
    if (newKey !== key) {
      data.attrs[newKey] = value;
      delete data.attrs[key];
    }
  });

  return data;
};
