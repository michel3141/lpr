#!/usr/bin/env node
import madge from "madge";
import { program } from "commander";

function filterDeps(deps, filter1 = "", filter2) {
  filter2 = filter2 || filter1;
  const filtered = {};
  Object.keys(deps)
    .filter((module) => module.search(filter1) > -1)
    .forEach((module) => {
      const key = module.replace(filter1, "");
      const prev = filtered[key] || {};
      deps[module]
        .filter((module) => module.search(filter2) > -1)
        .map((module) => module.replace(filter2, ""))
        .forEach((module) => (prev[module] = true));
      filtered[key] = prev;
    });
  return Object.entries(filtered).reduce(
    (acc, [src, dsts]) => ({ ...acc, [src]: Object.keys(dsts) }),
    {},
  );
}

function displayDeps(deps, { showEmpty } = {}) {
  console.log(
    Object.entries(deps)
      .filter(([src, dsts]) => !showEmpty && dsts.length > 0)
      .map(([src, dsts]) => (dsts.length ? dsts.map((dst) => `${src} > ${dst}`) : src))
      .flat()
      .join("\n"),
  );
}

async function run(features, options) {
  const { webpackConfig, selectors, actions, toSelectors, toActions } = options;
  const deps = (await madge(features, { webpackConfig })).obj();

  let filtered;

  if (selectors || (!actions && !toSelectors && !toActions)) {
    console.log("## selectors ##");
    filtered = filterDeps(deps, "/selectors.js", "/selectors.js");
    displayDeps(filtered);
  }

  if (actions) {
    console.log("## actions ##");
    filtered = filterDeps(deps, "/actions.js");
    displayDeps(filtered);
  }
  if (toSelectors) {
    console.log("## TMS => S ##");
    filtered = filterDeps(deps, /\/selectors.js$|\/actions\.js$|\/reducer\.js$/, "/selectors.js");
    displayDeps(filtered);
  }

  if (toActions) {
    console.log("## ARM => AT ##");
    filtered = filterDeps(deps, /\/actions\.js$|\/reducer\.js$/, "/actions.js");
    displayDeps(filtered);
  }
}

program
  .name("rtk-export")
  .description("ajoute les exports dans les fichier crée avec rtk")
  .option("--webpack-config <file>", "path to webpack config [madge]")
  .option("-s --selectors", "affiche les dépendences entre les selecteurs")
  .option("-a --actions", "affiche les dépendences entre les selecteurs")
  .option(
    "-S --to-selectors",
    "affiche les dépendences entre des thunks et des middlewares vers less selecteurs",
  )
  .option(
    "-A --to-actions",
    "affiche les dépendences entre des reducers et des middlewares vers less selecteurs",
  )
  .argument("<features>", "index file to features")
  .action(run);

program.parse();
