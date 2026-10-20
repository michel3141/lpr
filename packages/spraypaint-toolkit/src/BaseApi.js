import { SpraypaintBase } from 'spraypaint';

function createBaseApi({ url, apiPath, clientApplication = 'web-app' }, extra = {}) {
  // console.info(`jwtStorage: '${clientApplication}-jwt'`);
  const baseApi = SpraypaintBase.extend({
    static: {
      ...extra.static,
      clientApplication,
      baseUrl: url,
      apiNamespace: apiPath,
      jwtStorage: `${clientApplication}-jwt`,
      headers: {},
      abort: () => {},
      addHeaders: function (headers) {
        baseApi.headers = headers;
        return this;
      },
      beforeFetch: (url, options) => {
        // const abortController = new AbortController();
        // options.signal = abortController.signal
        // const abort = abortController.abort
        // un appel à abort arrête le fetch... comment mettre ça en place ???
        options.headers = { ...options.headers, ...baseApi.headers };
      },
      afterFetch: (response, json) => {
        baseApi.headers = {};
      },
    },
    methods: {
      // listen() n'abonne que la resource elle-même ; unlisten() de spraypaint
      // descend aussi dans les relations, sans garde contre les cycles : or
      // Graphiti renvoie toujours la linkage des belongs_to, et le deserializer
      // réutilise les instances d'un même payload (network.ips[i].network ===
      // network) => "too much recursion" au close() d'un document.
      // On ne désabonne donc que la resource, comme listen().
      unlisten: function () {
        const { relationships } = this;
        this.relationships = {};
        try {
          SpraypaintBase.prototype.unlisten.call(this);
        } finally {
          this.relationships = relationships;
        }
      },
      ...extra.methods,
    },
  });
  return baseApi;
}

/*
 * En réalité, une Resource est un endpoint particulier
 * c'est celui connecté au endpoint par défaut : /posts
 * Je le garde comme étape intermédiare pour créer les endpoints,
 * dans le cas où la même resource vienne de plusieurs endpoints
 * différents
 */
function createResource(baseApi, { attrs, jsonapiType }, extra = {}) {
  // défini en dur le endpoint par défaut
  const endpoint = `/${jsonapiType}`;
  const Resource = baseApi.extend({
    attrs,

    static: {
      sync: true, // active le lancement de afterSync
      ...extra.static,
      jsonapiType,
      endpoint,
    },

    methods: {
      afterSync: function (diff = {}) {
        // const { type, id } = this.resourceIdentifier
        return this;
        // console.log(`Change in ${type}-${id}`)
        // console.log(diff)
      },
      ...extra.methods,
    },
  });
  return Resource;
}

function createEndpoint(resource, endpoint, extra = {}) {
  if (!endpoint) {
    // same endpoint. extra paramèters/config
    return resource.extend(extra);
  }
  if (endpoint.startsWith(resource.apiNamespace)) {
    console.warn(`spraypaint-toolkit: broken endpoint '${endpoint}'. Fixing`);
    endpoint = endpoint.slice(resource.apiNamespace.length);
  }
  return resource.extend({
    static: { ...extra.static, endpoint },
    // methods: {} sans effet
  });
}

export { createBaseApi, createResource, createEndpoint };
