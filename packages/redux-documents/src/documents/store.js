const documents = new Map(); // map id to document
const resources = new Map(); // map resourceId to documents

const DEBUG = false;
const Logger = (...args) => DEBUG && console.log('[redux-documents/documents/store]', ...args);

export function isRegistered(doc) {
  return doc && documents.has(doc.id);
}

export function register(doc) {
  if (isRegistered(doc)) throw Error(`Document '#${doc.id}' already registered`);
  documents.set(doc.id, doc);
  registerResource(doc);
  Logger('RESOURCE_LIST', [...resources.keys()]);
  [...resources.entries()].forEach(([key, docs]) =>
    Logger('RESOURCE_DOC_LIST', key, [...docs].map(({ id }) => id).join('|'))
  );
}

export function unregister(doc) {
  if (!isRegistered(doc)) throw Error(`Document '#${doc.id}' is not registered`);
  unregisterResource(doc);
  documents.delete(doc.id);
}

export function getDocument(id) {
  return documents.get(id);
}

export function getResources(resourceId) {
  return [...(resources.get(resourceId) ?? [])];
}

export function registerResource(doc) {
  const { resourceId } = doc;
  if (!resourceId) return;
  if (!resources.has(resourceId)) resources.set(resourceId, new Set());
  resources.get(resourceId).add(doc);
  Logger('RESOURCE_ADD', resourceId);
}

const unregisterResource = (doc) => {
  const { resourceId } = doc;
  if (!resourceId) return;
  Logger('RESOURCE_DEL', resourceId);
  const docs = resources.get(resourceId);
  if (!docs) return;
  docs.delete(doc);
  if (docs.size === 0) resources.delete(resourceId);
};
