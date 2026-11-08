# @lpr/rtk

Store Redux et flux hors composants, sur redux-toolkit : events, intentions, thunks
d'orchestration, listeners.

## Installation

Le paquet est sur le registre `@lpr` ; dans le `.npmrc` du projet :

```ini
@lpr:registry=https://npm.lespyjamasrouges.fr/
```

```sh
pnpm add @lpr/rtk
```

`react` est en `peerDependencies` : l'app fournit le sien.

```js
import { addListener } from '@lpr/rtk';
import createReactStore from '@lpr/rtk/react';
```

## Documentation

- `Docs/README.rtk2.md` : events, intentions métier, orchestration.
- `Docs/README.rtk2.compléments.md` : compléments.
- `Docs/README.md` : conventions et dépendances entre reducers, middlewares, actions,
  thunks et sélecteurs.

## Release

Depuis la racine du dépôt : `make release-plan LIB=rtk`, puis `make release LIB=rtk`
(voir le `README.md` de la racine).
