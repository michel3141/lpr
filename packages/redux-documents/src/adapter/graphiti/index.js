import EndpointAdapter from "./endpoint";
import { CollectionAdapter } from "./document";
import createGraphitiCreator from "./createGraphiti";

export default function createJsonApiAdapter({ schema, clientApplication, ...params }) {
  if (!schema) {
    throw Error("{schema} is mandatory");
  }
  if (!clientApplication) {
    throw Error("{clientApplication} is mandatory");
  }
  const Graphiti = createGraphitiCreator(schema)(clientApplication, params);

  Object.entries(Graphiti).forEach(([key, value]) => {
    window[key] = value;
  });

  return new GraphitiAdapter(Graphiti);
}

class GraphitiAdapter {
  #endpoints;
  // eslint-disable-next-line no-unused-private-class-members
  #resources;
  // eslint-disable-next-line no-unused-private-class-members
  #types;

  constructor({ endpoints, resources, types }) {
    this.#endpoints = Object.fromEntries(
      Object.entries(endpoints).map(([url, { actions }]) => [
        url,
        new EndpointAdapter({ actions }),
      ]),
    );
    this.#resources = Object.fromEntries(
      Object.entries(resources).map(([resourceName, Resource]) => [Resource.jsonapiType, Resource]),
    );
    this.#types = types;
  }

  getEndpoint(url) {
    const endpoint = this.#endpoints[url];

    if (!endpoint) {
      throw new Error(`Endpoint '${url}' not found`);
    }

    return endpoint;
  }

  getObjectFor({ data, raw }) {
    if (Array.isArray(data)) {
      // ici on ne peut préciser le Endpoint associé
      // car la liste peut être vide
      return new CollectionAdapter({ raw, data });
    }

    const { endpoint: url } = data.klass;
    if (!url) {
      throw Error("spraypaint object sans endpoint url par défaut");
    }
    return this.getEndpoint(url).getObjectFor({ data, raw });
  }
}
