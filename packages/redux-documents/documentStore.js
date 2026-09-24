const store = new Map();

const defaultNeedFetch = (subscriberId) => {
  console.warn("onNeedFetch");
};

const defaultUpdate = (subscriberId, resourceId, changes, prev) => {
  console.warn("onUpdate");
};

const defaultSet = (subscriberId) => {
  console.warn("onSet");
};

const defaultDelete = (subscriberId, prev) => {
  console.warn("onDelete");
};

const listeners = {
  onNeedFetch: defaultNeedFetch,
  onUpdate: defaultUpdate,
  onSet: defaultSet,
  onDelete: defaultDelete,
};

export const onDocument = (handlers) => {
  listeners.onNeedFetch = handlers.onNeedFetch ?? defaultNeedFetch;
  listeners.onUpdate = handlers.onUpdate ?? defaultUpdate;
  listeners.onSet = handlers.onSet ?? defaultSet;
  listeners.onDelete = handlers.onDelete ?? defaultDelete;
};

const getEntry = (subscriberId, throwOnMissing = true) => {
  const entry = store.get(subscriberId);

  if (throwOnMissing && !entry) {
    throw new Error(`Document "${subscriberId}" not found`);
  }

  return entry;
};

export const getDocument = (subscriberId, throwOnMissing = true) =>
  getEntry(subscriberId, throwOnMissing)?.doc;

export const getRequest = (subscriberId, throwOnMissing = true) =>
  getEntry(subscriberId, throwOnMissing)?.request;

export const setDocument = (subscriberId, doc, request) => {
  store.set(subscriberId, { doc, request });
  listeners.onSet(subscriberId);
};

export const updateResourceInDocument = ({ subscriberId, resourceId }, changes = {}) => {
  const entry = getEntry(subscriberId);
  const { doc } = entry;

  const nextDoc = doc.isCollection ? doc.updateResource(resourceId, changes) : doc.update(changes);

  store.set(subscriberId, {
    ...entry,
    doc: nextDoc,
  });

  listeners.onUpdate(subscriberId, resourceId, changes, doc);
};

export const deleteLink = ({ subscriberId, resourceId }) => {
  const entry = getEntry(subscriberId);
  const { doc } = entry;

  if (doc.isCollection) {
    // supprime en local
    doc.removeResource(resourceId);
    // en attendant la réponse du serveur
    listeners.onNeedFetch(subscriberId);
  } else {
    doc.close();
    store.delete(subscriberId);
    listeners.onDelete(subscriberId, doc);
  }
};
