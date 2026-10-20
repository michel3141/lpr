# Cycle de vie

Voir le schéma [redux-documents.png](redux-documents.png) (source : `redux-documents.drawio`).

## Abonnement

1. Un composant appelle `subscribe({ doc })`.
2. Si le document n'est pas enregistré : `register(doc)` (store + index des resources), puis `doc.open(callbacks)`. Le document émet `open` → `OPEN` (le reducer crée son état).
3. `SUBSCRIBE` incrémente `subscriptions`.

## Désabonnement

1. `unsubscribe({ doc })` → `UNSUBSCRIBE` décrémente `subscriptions`.
2. Le listener teste `selectSubscribed`. S'il n'y a plus d'abonné : `doc.close()` → `CLOSE`.
3. Sur `CLOSE` : le reducer supprime l'état, un listener appelle `unregister(doc)`.

En StrictMode (abonnement, désabonnement, abonnement), le document est fermé puis rouvert.

## Modification

`doc.modify(changes, saveOptions)` applique les changements, émet `modify` (`MODIFY`), puis programme une sauvegarde différée (`delay` 500 ms par défaut). `saveOptions: false` ne sauvegarde pas. `doc.commit(options)` sauvegarde immédiatement et annule les sauvegardes en attente.

La sauvegarde émet `pending`, puis `fulfilled` ou `rejected`. Si la resource n'était pas persistée, `persist` est émis avant `fulfilled` :

- `PERSIST` → un listener appelle `registerResource(doc)` (la resource a maintenant sa `storeKey` définitive) puis émet `CREATE`.

## Resource

- `afterSync(diff)` → `SYNC` → `REFRESH` sur tous les documents de la resource (le `diff` est dans le payload).
- `doc.destroy()` → `DESTROY` → `DELETE` sur tous les documents de la resource (`deleted: true`).
