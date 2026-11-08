# React

Import : `@lpr/redux-documents/react`.

## `createScope(client, baseRequest)`

Retourne un scope : `{ endpoint, method, requests }` + un `fetcher` pour SWR. `scope.extend(request)` retourne un nouveau scope. La clé SWR est `{ endpoint, method, ...request }`.

## `Watch(client, Controller, Context)`

Retourne un composant `({ data, meta, ...rest })` (le `Obs` attendu par `Index` et `Show`) :

1. crée le document : `client.adapt(data)` ;
2. s'abonne (`subscribe` / `unsubscribe` selon le montage) ;
3. rend `Controller` dans `Context` avec `doc`, `deleted`, `version` et `...rest`.

Valeur du contexte :

```js
{
  data: { ...attributes, ...relationships, errors },
  meta: { meta, modify, commit, destroy, dirty, persisted, committing, error },
}
```

## `Index`

| Prop                             | Rôle                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `scope`                          | scope SWR                                                                    |
| `Obs`                            | composant rendu pour chaque resource                                         |
| `request`                        | paramètres ajoutés à la requête (`include`, `where`, …)                      |
| `pager`                          | hook de pagination (voir ci-dessous)                                         |
| `fallbackData`                   | donnée initiale SWR                                                          |
| `shouldRefresh(action, payload)` | `action` ∈ `create`, `destroy`, `sync` ; retourner `true` relance la requête |

Les autres props sont transmises à chaque `Obs`, ainsi que `meta`, `raw` et `reset` (relance la requête).

### Pagination

`pager` est un hook qui retourne `{ per, page, lastPage, updateCount }`. `Index` ajoute `per`, `page` et `stats[total]=count` à la requête, appelle `updateCount` avec le total, et précharge la page précédente, la suivante et la dernière. Seule la page affichée écoute `shouldRefresh`.

## `Show`

Comme `Index`, sans pagination. Indiquer `method: 'find'` et `id` dans `request`.

## Hooks

- `useDocument(doc)` → `{ deleted, version }`
- `useSubscribed(doc)` → booléen
- `useDocumentApi()` → `{ subscribe, unsubscribe, listen }`
- `useDocumentEvents()` → créateurs d'événements
