import Document from './document.js';

export default class SpraypaintClient {
  #endpoints;
  #resources;
  // eslint-disable-next-line no-unused-private-class-members
  #types;

  constructor({ endpoints, resources, types }) {
    this.#endpoints = Object.fromEntries(
      Object.entries(endpoints).map(([url, { actions }]) => [
        url,
        new Proxy(actions, {
          get(target, action) {
            let realAction = action;
            switch (action) {
              case 'all':
              case 'first':
                realAction = 'index';
                break;
              case 'find':
              case 'findSingle':
                realAction = 'show';
                break;
              case 'create':
                if (target.create) {
                  return (model) => new target.create.resource(model);
                }
                break;
            }
            const Model = target[realAction]?.resource;
            if (!Model) {
              throw new Error(`Endpoint '${url}' n'a pas l'action '${action}'`);
            }
            return Model;
          },
        }),
      ])
    );
    this.#resources = Object.fromEntries(
      Object.entries(resources).flatMap(([resourceName, Resource]) => [
        [resourceName, Resource],
        [Resource.jsonapiType, Resource],
      ])
    );
    this.#types = types;
  }

  api(endpointUrl) {
    const api = this.#endpoints[endpointUrl];

    if (!api) {
      throw new Error(`Endpoint '${endpointUrl}' not found`);
    }

    return api;
  }

  model(resourceName) {
    const model = this.#resources[resourceName];

    if (!model) {
      throw new Error(`Resource '${resourceName}' not found`);
    }

    return model;
  }

  adapt(data) {
    if (Array.isArray(data)) {
      throw Error('I cant adapt an array');
    }
    if (!data?.klass) {
      console.warn(data);
      throw Error('I can only adapt spraypaint Model instance');
    }

    const { endpoint: url } = data.klass;
    if (!url) {
      throw Error('spraypaint object sans endpoint url par défaut');
    }
    return new Document({ data });
  }
}
