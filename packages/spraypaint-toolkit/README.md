# `@lpr/spraypaint-toolkit`

Toolkit pour générer un client [Spraypaint](https://github.com/spraypaint/spraypaint) à partir d'un schéma JSON:API.

## Installation

```bash
pnpm install @lpr/spraypaint-toolkit
```

## Exports

```js
import createSpraypaintClient, {
  fetchSpraypaintClient,
  createBaseApi,
  createResource,
  createEndpoint,
} from '@lpr/spraypaint-toolkit';
```

### `createSpraypaintClient`

```js
createSpraypaintClient(clientApplication, schema, params?)
```

Crée un client Spraypaint à partir d'un schéma déjà chargé.

```js
const client = createSpraypaintClient('web-app', schema, {
  url: 'https://api.example.com',
  apiPath: '/api/v1',
});
```

`params` :

```js
{
  url: 'http://localhost:3000',
  apiPath: '/api/v1'
}
```

Retourne le schéma enrichi avec :

```js
{
  ...schema,
  resources,
  endpoints
}
```

---

### `fetchSpraypaintClient`

```js
await fetchSpraypaintClient(clientApplication, params?)
```

Récupère automatiquement le schéma puis crée le client.

Le schéma est chargé depuis :

```text
${url}${apiPath}/vandal/schema.json
```

Exemple :

```js
const client = await fetchSpraypaintClient('web-app', {
  url: 'https://api.example.com',
  apiPath: '/api/v1',
});
```

---

### `createBaseApi`

```js
createBaseApi(config, extra?)
```

Crée l'API Spraypaint de base.

```js
const api = createBaseApi({
  url: 'https://api.example.com',
  apiPath: '/api/v1',
  clientApplication: 'web-app',
});
```

Configuration :

```js
{
  (url, apiPath, (clientApplication = 'web-app'));
}
```

`extra` permet d'étendre la classe :

```js
{
  static: {},
  methods: {}
}
```

L'API fournit notamment :

```js
api.addHeaders({
  'X-Custom-Header': 'value',
});
```

Les headers sont appliqués à la prochaine requête puis réinitialisés.

---

### `createResource`

```js
createResource(baseApi, definition, extra?)
```

Crée une Resource Spraypaint.

```js
const Post = createResource(api, {
  jsonapiType: 'posts',
  attrs: {
    title: attr({ type: String }),
  },
});
```

Le endpoint par défaut est :

```text
/posts
```

`extra` permet d'ajouter des `static` et `methods`.

---

### `createEndpoint`

```js
createEndpoint(resource, endpoint, extra?)
```

Crée une Resource correspondant à un endpoint spécifique.

```js
const Post = createResource(api, {
  jsonapiType: 'posts',
  attrs: {...},
});

const TopPosts = createEndpoint(Post, '/top_posts');
```

Permet notamment d'utiliser une même Resource sur plusieurs endpoints :

```text
/posts
/top_posts
/search_posts
```

---

## Génération depuis le schéma

Les resources du schéma sont converties automatiquement :

```text
attributes       → attr()
belongs_to       → belongsTo()
has_one          → hasOne()
has_many         → hasMany()
many_to_many     → hasMany()
```

Les noms d'attributs sont camelizés :

```text
first_name → firstName
```

Les attributs avec `writable: false` sont configurés avec :

```js
persist: false;
```

Les endpoints du schéma sont également convertis en Resources Spraypaint et le préfixe `apiPath` est retiré :

```text
/api/v1/posts → /posts
```

## Exemple d'utilisation

```js
const client = await fetchSpraypaintClient('web-app', {
  url: 'https://api.example.com',
  apiPath: '/api/v1',
});

const Post = client.resources.PostResource;
const posts = client.endpoints['/posts'].actions.index;
const topPosts = client.endpoints['/top_posts'].actions.index;
```

La structure `client.resources` contient les Resources, tandis que `client.endpoints` reprend la structure des endpoints et de leurs actions définie dans le schéma.

## Concepts Spraypaint

Dans Spraypaint, il est utile de distinguer trois niveaux : **API**, **Resource** et **Endpoint**.

### `BaseApi`

`BaseApi` correspond à la **classe API Spraypaint**. Elle centralise la configuration commune au client :

```js
const api = createBaseApi({
  url: 'https://api.example.com',
  apiPath: '/api/v1',
  clientApplication: 'web-app',
});
```

Elle définit notamment :

- `baseUrl` : URL du serveur
- `apiNamespace` : préfixe de l'API
- `jwtStorage` : stockage du JWT
- les headers communs
- le comportement `beforeFetch` / `afterFetch`

Dans Spraypaint, cette classe constitue le point de départ à partir duquel sont définies les **Resources**.

---

### `Resource`

Une `Resource` Spraypaint représente un **type de ressource JSON:API**, et non une URL particulière.

Dans cette librairie :

```js
const Post = createResource(api, {
  jsonapiType: 'posts',
  attrs: {...},
});
```

`Post` représente donc le type JSON:API :

```text
posts
```

Elle porte :

- les attributs (`attr`)
- les relations (`belongsTo`, `hasOne`, `hasMany`)
- le `jsonapiType`
- un endpoint par défaut

La notion importante est que le **type JSON:API** est indépendant de l'URL utilisée pour l'obtenir.

---

### `Endpoint`

`Endpoint` n'est pas à proprement parler un concept de classe distinct dans Spraypaint.

Dans cette librairie, `createEndpoint()` crée en réalité une **extension (`extend`) d'une Resource**, en lui donnant un autre `endpoint` :

```js
const TopPosts = createEndpoint(Post, '/top_posts');
```

On obtient donc deux classes basées sur le même type JSON:API :

```text
Post       → jsonapiType: posts → endpoint: /posts
TopPosts   → jsonapiType: posts → endpoint: /top_posts
```

C'est particulièrement utile lorsqu'un même type JSON:API est exposé par plusieurs routes :

```text
/posts
/top_posts
/search/posts
```

## Hiérarchie dans la librairie

On peut donc représenter le modèle ainsi :

```text
SpraypaintBase
      │
      ▼
   BaseApi
      │
      ├── Resource: PostResource
      │       │
      │       ├── Endpoint: /posts
      │       ├── Endpoint: /top_posts
      │       └── Endpoint: /search/posts
      │
      └── Resource: UserResource
              │
              └── Endpoint: /users
```

Plus précisément, dans l'implémentation :

```js
SpraypaintBase
    ↓ extend()
BaseApi
    ↓ extend()
Resource
    ↓ extend()
Endpoint
```

Ainsi, dans la terminologie de cette librairie, **« Endpoint » désigne une variante de Resource configurée pour une URL donnée**, plutôt qu'une primitive Spraypaint distincte.
