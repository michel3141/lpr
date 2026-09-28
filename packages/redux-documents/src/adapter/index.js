import graphiti from './graphiti';

const adapters = {
  graphiti,
};

let adapter = null;

function setAdapter({ name, ...options }) {
  const create = adapters[name];
  if (!create) throw Error(`Invalid adapter '${name}'`);
  adapter = create(options);
  return adapter;
}

function getAdapter() {
  if (!adapter) throw Error('No adapter');
  return adapter;
}

function getEndpoint(endpoint) {
  return getAdapter().getEndpoint(endpoint);
}

function getObjectFor({ data, raw }) {
  return getAdapter().getObjectFor({ data, raw });
}

export { setAdapter, getAdapter, getEndpoint, getObjectFor };
