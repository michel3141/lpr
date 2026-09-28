import { camelize } from '@lpr/helpers-text';
import { attr, belongsTo, hasOne, hasMany } from 'spraypaint';
import { createBaseApi, createResource, createEndpoint } from './BaseApi';

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

  if (attribute.type.startsWith('array') || attribute.type.startsWith('hash')) {
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
    case 'belongs_to':
      return belongsTo({ type: resourceType });

    case 'has_one':
      return hasOne({ type: resourceType });

    case 'has_many':
    case 'many_to_many':
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
    attributes[camelize(name)] = createAttributeDefinition(definition);
  }

  for (const [name, definition] of Object.entries(resource.relationships)) {
    attributes[camelize(name)] = createRelationshipDefinition(definition, schema);
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
 * {
 *   "/api/v1/comments": {
 *     "actions": {
 *       "index": {
 *         "resource": "CommentResource"
 *       },
 *       "show": {
 *         "resource": "CommentResource"
 *       },
 *     }
 *   },
 *   "/api/v1/posts": {
 *     "actions": {
 *       "update": {
 *         "resource": "PostResource"
 *       },
 *       "destroy": {
 *         "resource": "PostResource"
 *       }
 *     }
 *   },
 *   "/api/v1/top_posts": {
 *     "actions": {
 *       "index": {
 *         "resource": "PostResource"
 *       }
 *     }
 *   }
 * }
 *
 */

function mapLeaves(value, callback, path = []) {
  if (value === null || typeof value !== 'object') {
    return callback(path, value);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, mapLeaves(child, callback, [...path, key])])
  );
}

/**
 * ---------------------------------------------------------------------------
 * Apiconfig
 * ---------------------------------------------------------------------------
 */

const defaultUrl = 'http://localhost:3000';

function createApiConfig(clientApplication, params = {}) {
  if (!params.url) {
    console.warn("'createSpraypaintClient' appelé sans {url}");
  }

  if (!clientApplication) {
    throw Error("'clientApplication' require");
  }

  return {
    url: defaultUrl,
    apiPath: '/api/v1',
    ...params,
    clientApplication,
  };
}

/**
 * ---------------------------------------------------------------------------
 * Schema
 * ---------------------------------------------------------------------------
 */

async function fetchSpraypaintClient(clientApplication, params = {}) {
  const apiConfig = createApiConfig(clientApplication, params);
  const { url, apiPath } = apiConfig;
  const schema = await fetch(`${url}${apiPath}/vandal/schema.json`);
  return createSpraypaintClient(clientApplication, schema, apiConfig);
}

/**
 * ---------------------------------------------------------------------------
 * Runtime Spraypaint resources
 * ---------------------------------------------------------------------------
 */

function createSpraypaintClient(clientApplication, schema, params = {}) {
  const apiConfig = createApiConfig(clientApplication, params);
  const api = createBaseApi(apiConfig);
  const { apiPath } = apiConfig;

  const { resources: resourceDefs } = schema;
  const endpointDefs = Object.fromEntries(
    Object.entries(schema.endpoints).map(([url, { actions }]) => {
      if (!url.startsWith(apiPath)) {
        throw Error(`Url '${url}' does not starts with apiPath '${apiPath}'`);
      }
      return [url.slice(apiPath.length), { actions }];
    })
  );

  const resources = Object.fromEntries(
    resourceDefs.map(({ name, ...definition }) => [
      name,
      createResource(api, createResourceDefinition(definition, schema)),
    ])
  );

  const endpoints = mapLeaves(endpointDefs, ([url], resourceName) =>
    createEndpoint(resources[resourceName], url)
  );

  window.api = api;
  window.resources = resources;
  window.endpoints = endpoints;

  return { ...schema, resources, endpoints };
}

export default createSpraypaintClient;
export { fetchSpraypaintClient };
