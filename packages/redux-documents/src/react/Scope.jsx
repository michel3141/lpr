import useSWR from 'swr';

class Scope {
  constructor(client, endpoint, method, requests = []) {
    this.client = client;
    this.endpoint = endpoint;
    this.method = method;
    this.requests = requests;

    this.fetcher = this.fetcher.bind(this);
  }

  get param() {
    return {
      endpoint: this.endpoint,
      method: this.method,
    };
  }

  extend(params) {
    const { method, endpoint, ...request } = params;
    return new Scope(this.client, endpoint ?? this.endpoint, method ?? this.method, [
      ...this.requests,
      request,
    ]);
  }

  async fetcher({ id, ...request } = {}) {
    const { endpoint, method, requests } = this.extend(request);
    let scope = this.client.api(endpoint)[method];

    for (const oneRequest of requests) {
      for (const [key, value] of Object.entries(oneRequest)) {
        if (typeof scope[key] === 'function') {
          scope = scope[key](value);
        } else {
          console.warn(`Unknown scope parameter: ${key}`, value);
        }
      }
    }

    return await scope[method](id);
  }
}

export const createScope = (client, baseRequest = {}) => new Scope(client).extend(baseRequest);

export const useScope = (request, scope, options) =>
  useSWR(request ? { ...scope.param, ...request } : null, scope.fetcher, options);
