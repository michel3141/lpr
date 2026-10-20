# Concepts

## Document

Un document (`SpraypaintDocument`, dans `@lpr/spraypaint-toolkit`) possède :

- un `id` local (uuid) : identifie le document, pas la resource ;
- un `resourceId` : la `storeKey` Spraypaint de sa resource principale ;
- `data` : l'instance du modèle Spraypaint ;
- `committing` et `error` : état de la sauvegarde en cours.

Plusieurs documents peuvent représenter la même resource (une liste et une page de détail, par exemple). Ils partagent le même `resourceId`.

## État Redux

```js
state['jsonapi-documents'] = {
  documents: {
    [docId]: { deleted: false, version: 3, subscriptions: 1 },
  },
};
```

- `version` est incrémentée à chaque événement qui change le document (`fulfilled`, `modify`, `pending`, `persist`, `refresh`, `rejected`). C'est ce qui force le rendu des composants abonnés.
- `deleted` passe à `true` quand la resource a été détruite.
- `subscriptions` compte les abonnés (composants montés). À zéro, le document est fermé.

## Store externe

`src/documents/store.js` garde, hors de Redux (les instances ne sont pas sérialisables) :

- `documents` : `docId` → document ;
- `resources` : `resourceId` → ensemble de documents.

## Resource events

| Événement | Origine                                        | Effet                                                  |
| --------- | ---------------------------------------------- | ------------------------------------------------------ |
| `CREATE`  | un document est persisté pour la première fois | à écouter (`shouldRefresh`) pour rafraîchir les listes |
| `SYNC`    | `afterSync(diff)` de la resource Spraypaint    | `REFRESH` sur chaque document de la resource           |
| `DESTROY` | `doc.destroy()`                                | `DELETE` sur chaque document de la resource            |

`CREATE`, `SYNC` et `DESTROY` n'ont pas de reducer : ce sont des signaux pour les listeners.
