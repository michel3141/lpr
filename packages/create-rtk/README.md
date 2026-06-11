# create-rtk (@lpr/create-rtk)

A small CLI generator to scaffold Redux Toolkit slices with a consistent structure.

## Usage

```bash
pnpm create @lpr/rtk <sliceName>
```

Example:

```bash
pnpm create @lpr/rtk user-profile
```

This generates a new folder:

```
user-profile/
├── package.json
├── vite.config.js
├── index.js
├── constants.js
├── actions.js
├── reducer.js
└── selectors.js
```

## Options

### `--react` / `-r`

Enables React-aware mode for `actions.js` and `selectors.js`.

```bash
pnpm create @lpr/rtk user-profile --react
```

### `--init`

Initializes the project after generation:

* `pnpm install`
* `git init`
* `git add .`
* `git commit -m "initial commit"`
* optional `git flow init -d`

```bash
pnpm create @lpr/rtk user-profile --init
```

### `--verbose` / `-v`

Enables detailed logs during generation.

```bash
pnpm create @lpr/rtk user-profile -v
```

## Notes

* The slice name is used as-is (no transformations).
* If the target directory already exists, the command fails.
* The project is generated using Vite + JavaScript (no TypeScript).

