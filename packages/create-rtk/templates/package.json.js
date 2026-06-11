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
    "p": "prettier -w './**/*.{js,jsx,css,scss,ts,mjs,cjs,json,html,md}'",
    "e": "pnpm eslint --report-unused-disable-directives --max-warnings 0 './**/*.{js,jsx,,mjs,cjs}'",
    "ef": "pnpm eslint --fix './**/*.{js,jsx,,mjs,cjs}'",
    "rtk": "pnpm rtk-export -w './**/*.js'"
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
    "prettier": "^3",
    "vite": "^8"
  }
}`;
}
