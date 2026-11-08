export function camelize(text) {
  return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}

export function pascalize(text) {
  return camelize(text).replace(/^./, (char) => char.toUpperCase());
}

export function decamelize(str, separator = '_') {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
    .toLowerCase();
}

export function constantize(str, separator = '_') {
  return decamelize(str, separator).toUpperCase();
}
