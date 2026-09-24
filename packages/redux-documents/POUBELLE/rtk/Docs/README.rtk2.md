# Events et intentions métier

L'application distingue trois niveaux :

```text
Event              = « ceci vient de se produire »
Intention métier   = « réalise ceci »
Orchestration      = « coordonne ces opérations »
```

L'UI ne connaît pas le store Redux ni son implémentation.

## 1. Events

Un event décrit un fait, généralement produit par l'UI.

Convention : suffixe `Event`.

```js
dialClickedEvent(...)
rowSelectedEvent(id, index)
inputChangedEvent(value)
```

Les events utilisent `createAction` et peuvent avoir plusieurs arguments.

Ils sont généralement consommés par des listeners :

```text
UI
 ↓
fooEvent(...)
 ↓
listener
 ↓
intention métier
```

Un composant générique est donc généralement **event-only**.

## 2. Intentions métier

Une intention exprime une opération métier :

```js
updatePost({ id, changes });
deletePost({ id });
publishPost({ id });
```

Une intention reçoit **toujours un seul argument**, généralement un objet.

Toutes les intentions métier utilisent `createAsyncThunk`, même lorsqu'elles sont actuellement synchrones.

Elles exposent donc toujours :

```js
updatePost.pending;
updatePost.fulfilled;
updatePost.rejected;
```

Exemple synchrone :

```js
const updatePost = createAsyncThunk("posts/update", ({ id, changes }, { getState }) => {
  const post = selectPost(getState(), id);

  return {
    ...post,
    ...changes,
  };
});
```

Puis :

```js
builder.addCase(updatePost.fulfilled, (state, action) => {
  state.posts[action.payload.id] = action.payload;
});
```

L'intention peut ensuite devenir asynchrone sans changer son interface :

```js
const updatePost = createAsyncThunk("posts/update", async ({ id, changes }) => {
  return await api.updatePost(id, changes);
});
```

Le contrat important est celui de `fulfilled.payload`.

Il doit représenter le **résultat métier**, indépendamment de son origine.

```text
meta.arg  → ce qui était demandé
payload   → ce qui a été obtenu
```

## 3. Thunks d'orchestration

Un thunk classique est utilisé pour **orchestrer plusieurs opérations**.

```js
const saveAndRefresh =
  ({ id }) =>
  async (dispatch) => {
    await dispatch(updatePost({ id }));
    await dispatch(refreshPosts({}));
  };
```

Il peut :

- déclencher plusieurs intentions ;
- attendre leurs résultats ;
- conditionner des opérations ;
- combiner plusieurs opérations.

Il ne représente pas nécessairement une intention métier et n'a donc pas besoin de `.pending`, `.fulfilled`, `.rejected`.

Si l'opération elle-même constitue une intention métier avec un résultat métier propre, elle doit être une `createAsyncThunk`.

## 4. Listeners

Les listeners font principalement le lien entre events et logique applicative :

```text
event
 ↓
listener
 ↓
intention métier
```

Ils peuvent également réagir aux résultats d'intentions et déclencher des orchestrations.

Ils ne remplacent pas une intention métier.

## 5. UI

Deux styles peuvent cohabiter :

```text
composant générique
    ↓
Event

composant métier
    ↓
Intention métier
```

Exemple générique :

```js
onChange={value => dialChangedEvent(value)}
```

Exemple métier :

```js
onSubmit={() => updatePost({ id, changes })}
```

Dans les deux cas, le composant ne connaît pas Redux en tant que mécanisme de stockage. Les dépendances peuvent être injectées.

## Règles

| Type             | API                | Arguments           | Rôle                      |
| ---------------- | ------------------ | ------------------- | ------------------------- |
| Event            | `createAction`     | plusieurs possibles | décrire un fait           |
| Intention métier | `createAsyncThunk` | **un seul objet**   | réaliser une opération    |
| Orchestration    | `thunk`            | selon besoin        | coordonner des opérations |
| Listener         | `startListening`   | —                   | réagir et déclencher      |

Principe directeur :

> **Les events décrivent ce qui s'est passé. Les intentions disent ce qui doit être réalisé. Les thunks d'orchestration coordonnent les opérations.**
