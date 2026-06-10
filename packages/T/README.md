# @lpr/T

Mini utilitaire de traduction (i18n) sans dépendance.

`createT()` crée une fonction `T` permettant :

* d'enregistrer des traductions ;
* de récupérer une traduction dans une langue donnée ;
* de retourner le texte original lorsqu'aucune traduction n'est disponible ;
* d'utiliser une syntaxe de template literal pour faciliter le repérage des chaînes.

## Philosophie

Ce module ne gère volontairement que le minimum :

* dictionnaires clé → valeur ;
* plusieurs langues ;
* fallback automatique sur la clé d'origine ;
* aucune dépendance ;
* aucune interpolation ;
* aucun chargement asynchrone ;
* aucune gestion de pluriels ou de formats régionaux.

Il est adapté aux petits projets ou comme couche i18n très légère.

## Installation


```js
import createT from '@lpr/T';

```

ou pour le dictionnaire global :
```js
import {T} from '@lpr/T';
```



## Utilisation

### Déclarer des traductions

```js
T({
  Hello: 'Bonjour',
  Goodbye: 'Au revoir'
});
```

Par défaut, les traductions sont enregistrées dans la langue définie lors de la création (`fr` par défaut).

### Récupérer une traduction

```js
T('Hello');
// => "Bonjour"
```

### Fallback automatique

Si aucune traduction n'est définie, le texte original est renvoyé :

```js
T('Unknown message');
// => "Unknown message"
```

## Gestion de plusieurs langues

Ajouter des traductions françaises :

```js
T({
  Hello: 'Bonjour',
  Goodbye: 'Au revoir'
}, 'fr');
```

Ajouter des traductions anglaises :

```js
T({
  Hello: 'Hello',
  Goodbye: 'Goodbye'
}, 'en');
```

Utiliser une langue spécifique :

```js
T('Hello', 'fr');
// => "Bonjour"

T('Hello', 'en');
// => "Hello"
```

## Syntaxe template literal

La fonction accepte également une chaîne sous forme de template literal :

```js
T`Hello`
```

Équivalent à :

```js
T('Hello')
```

Cette syntaxe est utile pour repérer facilement les chaînes traduisibles dans le code.

### Limitation

Seuls les templates sans interpolation sont acceptés :

```js
T`Hello`
```

est valide.

```js
const name = 'John';

T`Hello ${name}`;
```

provoque une erreur :

```txt
Error: T: Bad call
```

## API

### createT(defaultLang = 'fr')

Crée une nouvelle instance indépendante.

Paramètres :

| Nom         | Type   | Description                |
| ----------- | ------ | -------------------------- |
| defaultLang | string | Langue utilisée par défaut |

Retourne une fonction `T`.

### T(message, lang = defaultLang)

#### Ajouter des traductions

```js
T({
  Save: 'Enregistrer',
  Cancel: 'Annuler'
}, 'fr');
```

#### Lire une traduction

```js
T('Save', 'fr');
// => "Enregistrer"
```

#### Fallback

```js
T('Missing key');
// => "Missing key"
```

## Exemple complet

```js
import createT from '@lpr/T';

const T = createT('fr');

T({
  Hello: 'Bonjour',
  Goodbye: 'Au revoir'
});

T({
  Hello: 'Hello',
  Goodbye: 'Goodbye'
}, 'en');

console.log(T('Hello'));
// Bonjour

console.log(T('Hello', 'en'));
// Hello

console.log(T('Unknown'));
// Unknown
```

