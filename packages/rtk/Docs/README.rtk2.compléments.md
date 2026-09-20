Toute intention métier est exposée à l'UI comme une fonction asynchrone retournant le résultat de l'opération.
L'implémentation utilise createAsyncThunk, y compris pour les opérations actuellement synchrones. L'adaptateur d'API masque dispatch et unwrap().

Ça donne une frontière très propre :

UI API métier Redux

createPost(args) → dispatch(thunk) → createPost.pending
↓
fulfilled
↓
Promise<result> ← unwrap() ←─────────┘

---

retour vers l'ui :

const uuid = await createPost({})
à noté que createPost embarque dispatch _et_ .unwrap()

Trois options :

**1. Tout dans `payload`**

```js
return { uuid: requestId, post };
// unwrap() → { uuid, post }
```

**2. `uuid` dans `payload`, `post` dans `meta`**

```js
return fulfillWithValue(requestId, { post }); // post doit être sérialisable
// unwrap() → uuid
```

**3. Tout dans `payload`, filtré par l'API UI**

```js
return { uuid: requestId, post };

dispatch(createPost(args))
  .unwrap()
  .then(({ uuid }) => uuid);
```

La 3e permet de garder un payload complet côté Redux tout en exposant uniquement `uuid` à l'UI.
