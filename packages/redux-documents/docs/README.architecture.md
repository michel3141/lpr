# Séparation des responsabilités

La librairie sépare trois responsabilités principales.

```text
                 ┌──────────────┐
                 │    Redux     │
                 │ état /       │
                 │ événements   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ documentStore│
                 │ documents    │
                 │ synchronisés │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Adapter    │
                 │ accès aux    │
                 │ données      │
                 └──────┬───────┘
                        │
                        ▼
                Graphiti / Spraypaint
```

## Redux : l'état observable

Redux ne contient pas les documents eux-mêmes.

Il contient ce qui permet à l'application de connaître leur état :

- quels documents sont ouverts ;
- leur `status` ;
- leurs erreurs ;
- leurs options ;
- leur version ;
- les liens entre documents et resources.

Redux reçoit également les événements du cycle de vie.

Il décrit donc **l'état de la gestion des documents**, pas leur contenu.

## `documentStore` : les documents

Le `documentStore` possède les objets documents réels.

Il est responsable de leur manipulation et de leur cohérence locale :

- stocker un document ;
- le modifier ;
- remplacer une resource dans une collection ;
- fermer un document ;
- déclencher les événements nécessaires lorsque son contenu change.

Il connaît l'abstraction `Document` fournie par l'adaptateur, mais ne connaît pas Graphiti ou Spraypaint.

C'est également lui qui permet de maintenir plusieurs documents représentant une même resource synchronisés.

## Adapter : la technologie de données

L'adaptateur traduit entre l'API de la librairie et une technologie de données particulière.

Il encapsule notamment :

- la création et la récupération des endpoints ;
- la représentation d'une resource ou d'une collection ;
- la modification ;
- la sauvegarde ;
- la destruction ;
- la détection de synchronisation ;
- l'identification des resources.

L'implémentation actuelle utilise Graphiti/Spraypaint, mais cette couche permet d'en utiliser une autre sans modifier Redux ou le `documentStore`.

## Actions et listeners : l'orchestration

Les actions décrivent les opérations demandées par l'application :

```text
create
open
find
update
save
destroy
```

Les listeners réagissent aux événements du cycle de vie et coordonnent les différentes couches.

Cela permet notamment de ne pas transformer une action en un gros bloc connaissant simultanément Redux, le documentStore et les règles de synchronisation.

## Principe général

Chaque couche possède donc une question différente :

```text
Redux
→ « Dans quel état est ce document ? »

documentStore
→ « Quel est le document actuellement ? »

Adapter
→ « Comment manipuler ce document avec cette technologie ? »

Listeners
→ « Que doit-il se passer lorsqu'un événement survient ? »
```

L'objectif est que chacune puisse évoluer sans obliger les autres à connaître ses détails d'implémentation.
