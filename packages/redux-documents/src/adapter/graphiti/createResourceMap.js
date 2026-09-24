import { camelize } from "../../helpers";
import { attr, belongsTo, hasOne, hasMany } from "spraypaint";
import { createBaseApi, createResource, createEndpoint } from "@lpr/spraypaint-toolkit";

/**
 * ---------------------------------------------------------------------------
 * Schema
 * ---------------------------------------------------------------------------
 */

async function fetchSchema({ url, apiPath }) {
  const response = await fetch(`${url}${apiPath}/vandal/schema.json`);
  return response.json();
}

/**
 * ---------------------------------------------------------------------------
 * Resource definitions
 * ---------------------------------------------------------------------------
 */

function createAttributeDefinition(attribute) {
  const definition = { ...attribute };

  if (!attribute.writable) {
    definition.persist = false;
  }

  if (attribute.type.startsWith("array") || attribute.type.startsWith("hash")) {
    definition.dirtyChecker = (a, b) => JSON.stringify(a) !== JSON.stringify(b);
  }

  return attr(definition);
}

function findResource(schema, resourceName) {
  const resource = schema.resources.find(({ name }) => name === resourceName);

  if (!resource) {
    throw new Error(`Unknown resource '${resourceName}'`);
  }

  return resource;
}

function createRelationshipDefinition(relationship, schema) {
  const { type, resource: resourceName } = relationship;
  const relatedResource = findResource(schema, resourceName);
  const resourceType = relatedResource.type;

  switch (type) {
    case "belongs_to":
      return belongsTo({ type: resourceType });

    case "has_one":
      return hasOne({ type: resourceType });

    case "has_many":
    case "many_to_many":
      return hasMany({ type: resourceType });

    default:
      throw new Error(`Unknown relationship type '${type}'`);
  }
}

function createResourceAttributes(resource, schema) {
  const attributes = {};

  for (const [name, definition] of Object.entries({
    ...resource.attributes,
    ...resource.extra_attributes,
  })) {
    attributes[camelize(name, false)] = createAttributeDefinition(definition);
  }

  for (const [name, definition] of Object.entries(resource.relationships)) {
    attributes[camelize(name, false)] = createRelationshipDefinition(definition, schema);
  }

  return attributes;
}

function createResourceDefinition(resource, schema) {
  return {
    jsonapiType: resource.type,
    attrs: createResourceAttributes(resource, schema),
  };
}

/**
 * ---------------------------------------------------------------------------
 * Endpoint index
 * ---------------------------------------------------------------------------
 *
 * Endpoints are intentionally kept as a complete list.
 *
 * {
 *   CommentResource: [
 *     "/api/v1/comments"
 *   ],
 *   PostResource: [
 *     "/api/v1/posts",
 *     "/api/v1/top_posts"
 *   ]
 * }
 */

function indexEndpointsByResource(schema) {
  const endpointsByResource = {};

  for (const [path, { actions }] of Object.entries(schema.endpoints)) {
    // eslint-disable-next-line no-unreachable-loop
    for (const { resource: resourceName } of Object.values(actions)) {
      endpointsByResource[resourceName] ??= [];
      endpointsByResource[resourceName].push(path);
      break; // que la première action
    }
  }

  return endpointsByResource;
}

/**
 * ---------------------------------------------------------------------------
 * Parsed schema
 * ---------------------------------------------------------------------------
 */

function parseResources(schema) {
  const endpointsByResource = indexEndpointsByResource(schema);

  return schema.resources.map((resource) => ({
    ...resource,
    model: createResourceDefinition(resource, schema),
    endpoints: endpointsByResource[resource.name] ?? [],
  }));
}

/**
 * ---------------------------------------------------------------------------
 * Runtime Spraypaint resources
 * ---------------------------------------------------------------------------
 */

function createResourceMapCreator(schema) {
  const resources = parseResources(schema);
  return (clientApplication, params = {}) => {
    const apiConfig = {
      url: "http://localhost:3000",
      apiPath: "/api/v1",
      ...params,
      clientApplication,
    };

    const api = createBaseApi(apiConfig);
    const resourceMap = {};

    for (const definition of resources) {
      const { name, model, endpoints } = definition;

      const Resource = createResource(api, model);

      const endpointObjects = endpoints.map((path) => createEndpoint(Resource, path));

      resourceMap[Resource.jsonapiType] = {
        name,
        Resource,
        primary: endpointObjects.at(0),
        endpoints: endpointObjects,

        endpoint: endpointObjects.at(0),

        setDefaultEndpoint(index) {
          /*
           * par nom : '/posts' '/top_posts'
           * par index : 0 (pour primary), 1, ...
           */
          const endpoint =
            this.endpoints.find((Endpoint) => Endpoint.endpoint === index) ?? this.endpoints[index];

          if (!endpoint) {
            throw new Error(`Unknown endpoint index ${index} for ${this.name}`);
          }

          this.endpoint = endpoint;
        },
      };
    }

    return resourceMap;
  };
}

export default createResourceMapCreator;
export { fetchSchema };
