export function toCamelCase(str, upperFirst = false) {
  return str
    .split('-')
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0 && !upperFirst) return part.toLowerCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}
