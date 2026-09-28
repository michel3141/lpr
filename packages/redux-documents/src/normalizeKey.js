export function normalizeKey(key) {
  if (key !== null && key.storeKey) {
    return normalizeKey(key.storeKey);
  }

  if (typeof key === 'string') {
    if (!key || key.startsWith(':')) {
      throw new TypeError('Key must not be empty or start with `:`');
    }

    return key;
  }

  if (
    key !== null &&
    typeof key === 'object' &&
    typeof key.type === 'string' &&
    key.type.length > 0 &&
    (typeof key.id === 'string' || Number.isInteger(key.id)) &&
    String(key.id).length > 0
  ) {
    return `:${key.type}:${key.id}`;
  }

  console.warn('Invalid key', key);
  throw new TypeError('Invalid key');
}
