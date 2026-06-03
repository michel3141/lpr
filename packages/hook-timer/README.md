# @lpr/hook-timer

Hooks React minimalistes pour utiliser `setTimeout` et `setInterval`.

## Installation


```js
pnpm add @lpr/hook-timer
import { useTimeout, useInterval, useIntervalNow } from "@lpr/hook-timer";
```

## API

### useTimeout

```js
useTimeout(callback, timeout);
useTimeout(callback, timeout, deps);
```

Exécute `callback` une fois après `timeout` millisecondes.

### useInterval

```js
useInterval(callback, interval);
useInterval(callback, interval, deps);
```

Exécute `callback` toutes les `interval` millisecondes.

### useIntervalNow

```js
useIntervalNow(callback, interval);
useIntervalNow(callback, interval, deps);
```

Exécute `callback` immédiatement puis toutes les `interval` millisecondes.

## Exemple

```jsx
function Example({ userId }) {
  useTimeout(() => {
    console.log("Timeout");
  }, 1000, [userId]);

  useInterval(() => {
    console.log("Interval");
  }, 5000, [userId]);

  return null;
}
```

## Notes

* Le timer est recréé lorsque la durée (`timeout` / `interval`) ou l'une des dépendances (`deps`) change.
* `deps` suit la même logique que le tableau de dépendances de `useEffect`.

