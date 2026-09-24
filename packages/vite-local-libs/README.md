# vite-local-libs

Permet d'utiliser localement les sources de librairies JavaScript dans une application Vite, sans avoir à publier une nouvelle version à chaque modification.

## Structure

```text
app/
├── libs/
│   ├── lib-a/
│   │   └── package.json
│   └── lib-b/
│       └── package.json
├── src/
└── vite.config.js
```

Chaque librairie doit exposer son `name` et ses `exports` dans son `package.json`.

## Vite

```js
import { defineConfig } from "vite";
import { importLibs } from "vite-local-libs";

export default defineConfig({
  resolve: {
    alias: importLibs("libs"),
  },
});
```

Le paramètre de `importLibs` est optionnel et vaut `.` par défaut. Il permet de choisir le répertoire contenant les librairies locales.

Les imports habituels sont alors redirigés vers les sources locales :

```text
@my-org/lib-a → ./libs/lib-a/...
@my-org/lib-b → ./libs/lib-b/...
```

Cela permet de tester et déboguer les librairies directement dans l'application, sans publier de nouvelles versions à chaque changement.
