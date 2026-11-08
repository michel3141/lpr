# Logger Utility

Petit utilitaire de logging pour centraliser les messages de debug et ajouter un préfixe par module.

## Installation

Ce module dépend de :

```js
import isDevMode from '@lpr/is-dev-mode';
```

Les logs sont affichés uniquement lorsque `isDevMode` est vrai.

---

## API

### `logger(...args)`

Fonction de base utilisée par tous les loggers.

```js
import { logger } from './logger';

logger('Application démarrée');
logger('Utilisateur', user);
```

En mode développement :

```txt
Application démarrée
Utilisateur { ... }
```

En production, aucun log n'est affiché.

---

### `createLogger(name)`

Crée une fonction de log préfixée par un nom de module.

```js
import createLogger from './logger';

const log = createLogger('Auth');

log('Connexion réussie');
```

Résultat :

```txt
[Auth] Connexion réussie
```

Pratique pour identifier rapidement l'origine des messages.

---

### `fullLogger(name)`

Version enrichie du logger avec quelques helpers.

```js
import { fullLogger } from './logger';

const log = fullLogger('Sync');

log('Démarrage');
log.action('Téléchargement en cours');
log.end('Terminé');
```

Résultat :

```txt
[Sync] Démarrage
[Sync] Téléchargement en cours
[Sync] Terminé
```

#### Méthodes disponibles

##### `log(...args)`

Logger standard.

```js
log('Message');
```

##### `log.action(...args)`

Met en évidence une action importante via un style CSS dans la console.

```js
log.action('Création utilisateur');
```

##### `log.end(message)`

Affiche un message de fin d'opération avec un style plus discret.

```js
log.end('Fin du traitement');
```

---

## Exemple complet

```js
import createLogger, { fullLogger } from './logger';

const authLog = createLogger('Auth');
const syncLog = fullLogger('Sync');

authLog('Utilisateur connecté');

syncLog.action('Synchronisation démarrée');
syncLog('Étape 1');
syncLog('Étape 2');
syncLog.end('Synchronisation terminée');
```

## Notes

- Les logs ne sont affichés qu'en mode développement.
- Une implémentation de logging distant est présente mais actuellement commentée dans le code.
- Les objets passés en argument sont transmis directement à `console.log`.
