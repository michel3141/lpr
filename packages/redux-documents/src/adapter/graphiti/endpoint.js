import { ObjectAdapter, CollectionAdapter } from './document';

export default class EndpointAdapter {
  /*
   * #endpoint possède une collections d'actions
   * { actions:
  /*    { index: {…}, show: {…}, create: {…}, update: {…}, destroy: {…} }
   * }
   * disponibles pour cet Endpoint
   */
  #endpoint;

  constructor(endpoint) {
    this.#endpoint = endpoint;
  }

  get endpoint() {
    return this.#endpoint;
  }

  getObjectFor({ raw, data }) {
    if (Array.isArray(data)) {
      // ici on pourrait préciser le Endpoint associé
      // car on vient de all
      return new CollectionAdapter({ raw, data });
    }

    return new ObjectAdapter({ raw, data });
  }

  getResource(action) {
    const Resource = this.endpoint.actions[action]?.resource;
    if (!Resource) {
      throw Error(`Endpoint n'a pas l'action '${action}'`);
    }
    return Resource;
  }

  create(params) {
    const Resource = this.getResource('create');
    const data = new Resource(params);

    return this.getObjectFor({ data });
  }

  async find(id, fetcher) {
    const Resource = this.getResource('show');
    return this.getObjectFor(await fetcher(Resource).find(id));
  }
  async findSingle(fetcher) {
    const Resource = this.getResource('show');
    return this.getObjectFor(await fetcher(Resource).findSingle());
  }
  async first(fetcher) {
    const Resource = this.getResource('index');
    return this.getObjectFor(await fetcher(Resource).first());
  }
  async all(fetcher) {
    const Resource = this.getResource('index');
    return this.getObjectFor(await fetcher(Resource).all());
  }
}
