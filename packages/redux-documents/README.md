# Documents

Cette librairie gère le cycle de vie de documents et maintient automatiquement synchronisées les différentes instances d'une même resource.

Un document est identifié dans l'application par un `subscriberId`. Il peut représenter une resource unique ou une collection.

## Ouvrir un document

À partir d'une donnée existante :

```js
dispatch(
  open({
    subscriberId: "user",
    data: user,
  }),
);
```

Ou depuis un endpoint :

```js
dispatch(
  find({
    subscriberId: "user",
    endpoint: "/users",
    id: 42,
  }),
);
```

Les autres opérations disponibles sont `create`, `findSingle`, `first` et `all`.

## Modifier

```js
dispatch(
  update({
    subscriberId: "user",
    changes: {
      name: "Jane",
    },
  }),
);
```

La modification est d'abord locale. Les autres documents contenant la même resource sont automatiquement mis à jour.

## Sauvegarder

```js
dispatch(
  save({
    subscriberId: "user",
  }),
);
```

Le résultat indique si la sauvegarde a réussi :

```js
const { success } = await dispatch(save(...));
```

`success === false` signifie que la requête a été effectuée mais que la sauvegarde a été refusée, par exemple à cause d'une validation métier.

Une erreur technique provoque le rejet de l'action.

## Détruire et fermer

```js
dispatch(
  destroy({
    subscriberId: "user",
  }),
);
```

Détruit la resource côté serveur et met à jour les documents qui la référencent.

Pour simplement retirer un document de l'application :

```js
dispatch(CLOSE_EVENT("user"));
```

`CLOSE_EVENT` n'effectue aucune opération serveur.

## Événements

Les principaux événements sont :

- `OPEN_EVENT` : document ouvert ;
- `UPDATE_EVENT` : document modifié localement ;
- `RESOURCES_EVENT` : resources contenues dans le document ;
- `CLOSE_EVENT` : document fermé.

`UPDATE_EVENT` indique une modification locale. Il ne signifie pas que le serveur est synchronisé.

## État

Redux conserve l'état de gestion du document :

```js
{
  status,
  error,
  saveOptions,
  updateOptions,
  version,
}
```

Le document lui-même est conservé dans le `documentStore`.

Les statuts principaux sont :

```text
opened → pending → synced
             ↓
           error

synced → dirty → updating → synced
                         ↓
                       error
```

La librairie utilise un adaptateur pour isoler Redux et le `documentStore` de la technologie utilisée pour manipuler les données. L'adaptateur fourni utilise Graphiti/Spraypaint.

# React

Cette lib propose :

- un hook [`useApi`](./docs/react.md)
- un créateur de Provider [`createApiProvider`](./docs/README.react.createApiProvider.md)
