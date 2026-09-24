# `createApiProvider`

`createApiProvider` crée un Provider React spécialisé pour un modèle, ainsi que le hook permettant d'accéder à son API.

```js
const { Provider: PostProvider, use: usePostApi } = createApiProvider("posts");
```

Le paramètre correspond au même paramètre que le premier argument de `useApi`.

## Fournir un document

Le Provider peut recevoir une resource existante :

```jsx
<PostProvider data={post}>
  <PostView />
</PostProvider>
```

Le composant enfant récupère alors l'API avec le hook associé :

```jsx
const PostView = () => {
  const { document, update, save } = usePostApi();

  // ...
};
```

Le `subscriberId` peut être fourni explicitement :

```jsx
<PostProvider data={post} subscriberId={`post:${post.id}`}>
  <PostView />
</PostProvider>
```

S'il n'est pas fourni, `useApi` en génère automatiquement un.

## Charger un document

Le Provider peut également déclencher une opération de lecture au montage.

Pour une collection :

```jsx
<PostProvider method="all" fetcher={fetcher}>
  <PostList />
</PostProvider>
```

Pour une resource :

```jsx
<PostProvider method="find" id={42}>
  <PostView />
</PostProvider>
```

Les méthodes de lecture disponibles sont :

```text
all
first
find
findSingle
```

`fetcher` est transmis à la méthode correspondante.

Pour `find`, il est appelé avec :

```js
find(id, fetcher);
```

Pour les autres méthodes :

```js
first(fetcher);
all(fetcher);
findSingle(fetcher);
```

## Exemple

```js
const { Provider: PostProvider, use: usePostApi } = createApiProvider("posts");
```

```jsx
const PostList = () => (
  <PostProvider method="all">
    <PostListView />
  </PostProvider>
);

const PostListView = () => {
  const {
    document: { data: posts },
  } = usePostApi();

  return posts?.map((post) => (
    <PostProvider key={post.id} data={post} subscriberId={`post:${post.id}`}>
      <PostView />
    </PostProvider>
  ));
};
```

Chaque Provider expose la même API que `useApi` :

```js
{
  subscriberId,
  document,
  open,
  create,
  find,
  findSingle,
  first,
  all,
  update,
  save,
  destroy,
}
```

Le Provider ajoute uniquement une couche React Context : il permet de rendre cette API disponible à toute une sous-arborescence sans avoir à transmettre le document et ses méthodes par les props.
