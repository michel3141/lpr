const createId = ({ resourceIdentifier: { type, id } }) => `${type}:${id}`;

const updateData = (data, changes) => {
  for (const [key, value] of Object.entries(changes)) {
    // XXX eslint-disable-next-line no-underscore-dangle
    if (key !== "id" && key in data.attributes) {
      // ._attributes à l'origine ??
      // relationships ?
      data[key] = value;
    }
  }
};

class ObjectAdapter {
  #data;
  #raw;

  constructor({ raw, data }) {
    this.#raw = raw;
    this.#data = data;
  }

  get raw() {
    return this.#raw;
  }

  get isCollection() {
    return false;
  }

  get data() {
    const data = this.#data;

    if (!data) {
      console.warn("DATA is NULL");
      return null;
    }

    return data.dup();
  }

  get resourceIds() {
    return [createId(this.#data)];
  }

  close() {
    this.#data = null;
  }

  update(changes) {
    const data = this.data;

    updateData(data, changes);

    return new ObjectAdapter({
      data,
    });
  }

  isSync() {
    const data = this.data;

    if (!data) return true;

    return !data.isDirty();
  }

  flat() {
    throw new Error("Not implemented");
    // should go with .raw !!
  }

  async save({ with: With } = {}) {
    const data = this.data;
    const success = await data.save({ with: With }); // with: undefined ??

    return success ? data : false;
  }

  async destroy() {
    return this.data.destroy();
  }
}

class CollectionAdapter {
  #data;
  #raw;

  constructor({ raw, data }) {
    this.#raw = raw;
    this.#data = data;
  }

  get raw() {
    return this.#raw;
  }

  get isCollection() {
    return true;
  }

  get data() {
    const data = this.#data;

    if (!data) {
      console.warn("DATA is NULL");
      return [];
    }

    return data.map((datum) => datum.dup());
  }

  get resourceIds() {
    return this.#data.map(createId);
  }

  removeResource(resourceId) {
    const data = this.data;

    this.#data = data.filter((datum) => createId(datum) !== resourceId);
  }

  updateResource(resourceId, changes) {
    const data = this.data;

    data.forEach((datum) => {
      if (createId(datum) === resourceId) {
        updateData(datum, changes);
      }
    });

    return new CollectionAdapter({
      data,
    });
  }

  isSync() {
    const data = this.data;

    if (!data) return true;

    return data.all((datum) => !datum.isDirty());
  }

  flat() {
    throw new Error("Not implemented");
    // should go with .raw !!
  }
}

export { ObjectAdapter, CollectionAdapter };
