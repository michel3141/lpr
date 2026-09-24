import graphiti from "./graphiti";

const adapters = {
  graphiti,
};

let adapter = null;

function setAdapter(name) {
  const create = adapters[name];
  if (!create) throw Error(`Invalid adapter '${name}'`);
  return (initializer) => {
    adapter = create(initializer);
  };
}

function getAdapter() {
  if (!adapter) throw Error("No adapter");
  return adapter;
}

function getModel(model) {
  return getAdapter().getModel(model);
}

function getObjectFor({ data, raw }) {
  return getAdapter().getObjectFor({ data, raw });
}

export { setAdapter, getAdapter, getModel, getObjectFor };
