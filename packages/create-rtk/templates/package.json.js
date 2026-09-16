export function buildPackageJson(sliceName, options) {
  return `{
  "author": "michel3141 <michel3141@wanadoo.fr> (https://github.com/michel3141)",
  "name": "@lpr/${sliceName}",
  "version": "0.0.0",
  "description": "",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./actions": "./dist/actions.js",
    "./selectors": "./dist/selectors.js",
    "./constants": "./dist/constants.js"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "p": "oxfmt",
    "e": "oxlint"
    "ef": "oxlint --fix",
    "rtk": "pn rtk-export -w './**/*.js'"
  },
  "keywords": [],
  "license": "ISC",
  "dependencies": {
  },
  "peerDependencies": {
    "@lpr/rtk": "1",
    "react": "^19"
  },
  "devDependencies": {
    "oxfmt": "^0",
    "oxlint": "^1",
    "vite": "^8"
  }
}`;
}
