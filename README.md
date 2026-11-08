# @lpr

Libs JavaScript généralistes, publiées sur `npm.lespyjamasrouges.fr` sous le scope `@lpr`.
Une lib par dossier, `packages/<nom>` (le nom du paquet sans le scope).

| Lib                  | Thème | Rôle                                                        |
|----------------------|-------|-------------------------------------------------------------|
| `create-rtk`         | dev   | génère un slice `@lpr/rtk` (`pnpm create @lpr/rtk <slice>`) |
| `vite-local-libs`    | dev   | sources locales d'une lib dans une app Vite                 |
| `hook-timer`         | hooks | hooks `setTimeout` et `setInterval`                         |
| `helpers-text`       | texte | camelCase, décamelisé, constantes                           |
| `is-dev-mode`        | dev   | détecte le mode développement                               |
| `logger`             | dev   | journaux de débogage, préfixés par module                   |
| `T`                  | texte | traductions (i18n), sans dépendance                         |
| `spraypaint-toolkit` | rails | clients spraypaint construits depuis le schéma JSON:API     |
| `rails-cable`        | rails | consommateur ActionCable partagé                            |
| `rtk`                | redux | store et flux hors composants, sur redux-toolkit            |
| `redux-documents`    | redux | cycle de vie des documents spraypaint                       |
| `local-storage`      | redux | état persistant dans le `localStorage`                      |

## Commits

`<type>(<lib>): <description>`, le scope est le nom du dossier. Seuls `feat`, `fix`,
`perf` et `refactor` au scope d'une lib comptent pour sa version ; un commit sans scope
(`chore: oxfmt`) n'en déclenche aucune.

## Release

```sh
make release-plan LIB=rtk   # version et CHANGELOG calculés, rien d'écrit
make release LIB=rtk        # commit chore(rtk): version x.y.z, tag rtk@x.y.z, pnpm publish
git push                    # push.followTags envoie le tag
```

`bin/release` refuse un dépôt modifié ou une autre branche que `main`. La configuration
cz de chaque lib est tirée de `cz.toml.in`. `CZ=` désigne une autre commande cz (Docker).

Notes : `docs/`.
