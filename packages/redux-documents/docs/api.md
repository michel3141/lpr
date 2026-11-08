# API

## `@lpr/redux-documents`

Export par défaut : `{ name, reducer, listeners }`, à passer à `createReactStore({ slices: [...] })`. `name` vaut `jsonapi-documents`.

## `@lpr/redux-documents/actions`

### Actions

| Action                      | Rôle                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `subscribe({ doc })`        | enregistre et ouvre le document si besoin, ajoute un abonné ; retourne une fonction de désabonnement |
| `unsubscribe({ doc })`      | retire un abonné ; ferme le document s'il n'y en a plus                                              |
| `listen(predicate, effect)` | ajoute un listener Redux ; retourne la fonction qui le retire                                        |

### Événements

Document : `OPEN`, `CLOSE`, `DELETE`, `FULFILLED`, `MODIFY`, `PENDING`, `PERSIST`, `REFRESH`, `REJECTED`, `SUBSCRIBE`, `UNSUBSCRIBE`. Resource : `CREATE`, `DESTROY`, `SYNC`. Tous s'exportent avec le suffixe `_EVENT`.

Payloads : document → `{ id }` (`REFRESH` ajoute `diff`) ; resource → `{ resourceId, type, id, diff? }`.

## `@lpr/redux-documents/selectors`

- `selectDocument(state, doc)` → `{ deleted, version }`
- `selectSubscribed(state, doc)` → booléen

## `@lpr/redux-documents/react`

`Watch`, `createScope`, `Index`, `Show` (voir [react.md](react.md)).
