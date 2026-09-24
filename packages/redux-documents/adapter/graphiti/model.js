import { CollectionAdapter, ObjectAdapter } from "./document";

export default class ModelAdapter {
  #Model;

  constructor(Model) {
    this.#Model = Model;
  }

  get Model() {
    return this.#Model;
  }

  get jsonapiType() {
    return this.#Model.klass.jsonapiType;
  }

  getScope(fetcher = (x) => x) {
    return fetcher(this.Model);
  }

  create(params) {
    const data = new this.Model(params);

    return this.getObjectFor({ data });
  }

  getObjectFor({ raw, data }) {
    if (Array.isArray(data)) {
      return new CollectionAdapter({ raw, data });
    }

    return new ObjectAdapter({ raw, data });
  }

  async find(id, fetcher) {
    return this.getObjectFor(await this.getScope(fetcher).find(id));
  }
  async findSingle(fetcher) {
    return this.getObjectFor(await this.getScope(fetcher).findSingle());
  }
  async first(fetcher) {
    return this.getObjectFor(await this.getScope(fetcher).first());
  }
  async all(fetcher) {
    return this.getObjectFor(await this.getScope(fetcher).all());
  }
}
