function toCamelCase(str = '') {
  return str.trim().split(/[ -_:]/)
    .map(word => word[0].toUpperCase() + word.substring(1))
    .join('');
}

module.exports = toCamelCase;
