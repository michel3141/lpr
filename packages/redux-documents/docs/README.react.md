# React

La librairie fournit `useApi` pour connecter un composant React à un document.

```js
const { document, update, save, destroy } = useApi("/posts", undefined, "post:42");
```

Le hook gère automatiquement l'ouverture et la fermeture de la souscription.

## Charger une collection

```js
const { document, all } = useApi("/posts");

useEffect(() => {
  all((scope) => scope.includes("comments"));
}, [all]);

const { data: posts } = document;
```

`document.data` contient les données du document courant.

## Utiliser une resource existante

Un objet provenant d'un autre document peut directement être passé à `useApi` :

```js
const { document } = useApi(post, undefined, `post:${post.id}`);
```

La librairie crée alors une souscription pour cette resource.

C'est ce mécanisme qui permet à plusieurs composants de manipuler des instances d'une même resource tout en les maintenant synchronisées.

## Modifier et sauvegarder

```js
const { document, update, save } = useApi(post, undefined, `edit-post:${post.id}`);

const { title } = document.data;

return (
  <>
    <input value={title} onChange={(event) => update({ title: event.target.value })} />

    <button onClick={save}>Enregistrer</button>
  </>
);
```

`update` modifie le document localement.

`save` demande sa sauvegarde côté serveur.

## Détruire

```js
const { destroy } = useApi(comment, undefined, `comment:${comment.id}`);

<button onClick={destroy}>Supprimer</button>;
```

La destruction est propagée aux autres documents qui contiennent cette resource.

## Options

Les options peuvent être passées au deuxième argument :

```js
const api = useApi("/posts", {
  updateOptions: {
    // comportement des mises à jour
  },
  saveOptions: {
    // options de sauvegarde
  },
});
```

## `subscriberId`

Le troisième argument permet de contrôler explicitement l'identité de la souscription :

```js
useApi(post, undefined, `post:${post.id}`);
```

Si aucun `subscriberId` n'est fourni, un identifiant est généré automatiquement.

Il est utile de fournir un identifiant explicite lorsqu'un même document doit être référencé de manière stable par plusieurs rendus ou composants.

## API exposée

`useApi` retourne :

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
  refetch,
  destroy,
}
```

Les méthodes liées à un endpoint (`create`, `find`, `findSingle`, `first`, `all`) sont disponibles lorsque `useApi` est utilisé avec une url de endpoint.

Avec une resource ou un document existant, les opérations `open`, `update`, `save` et `destroy` sont les principales opérations utilisées.

## Principe

Un composant ne manipule pas directement Redux ni le `documentStore`.

```text
React component
      │
      ▼
    useApi
      │
      ├── document
      └── actions
             │
             ▼
       document lifecycle
```

Le composant travaille donc avec le document et ses opérations, tandis que la librairie prend en charge la souscription, le cycle de vie et la synchronisation avec les autres documents.
