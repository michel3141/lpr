#!/usr/bin/env node
import { program } from "commander";
import esquery from "esquery";
import { Parser } from "acorn";
import acornJsx from "acorn-jsx";
import prettier from "@prettier/sync";
import { camelize } from "inflected";
import fs from "fs";
import { globSync } from "glob";

const parseNodes = (nodes, source, tab) => {
  nodes.forEach((node) => parseNode(node, source, tab));
};
const parseNode = (node, source = "", tab = "") => {
  if (!node?.type) return;
  console.log(tab + "\x1b[31;40m[" + node.type + "]\x1b[0m");
  // const { start, end } = node;
  // console.log(tab + '\x1b[34;40m#' + source.slice(start, end) + '#\x1b[0m');
  let hasChild = false;
  for (const [id, child] of Object.entries(node)) {
    const newTab = " ".repeat(tab.length) + id + ">";
    if (Array.isArray(child)) {
      hasChild = child.reduce((a, c) => a || c?.type, hasChild);
      parseNodes(child, source, newTab);
    } else {
      hasChild = hasChild || child?.type;
      parseNode(child, source, newTab);
    }
  }
  if (!hasChild) {
    console.log(" ".repeat(tab.length), source.slice(...node.range));
  }
};

const mkSelect = (prop) => "select" + camelize(prop);
const mkUse = (prop) => "use" + camelize(prop);

const autoexport = (rtkNode, options) => {
  const { rtk } = rtkNode;
  if (rtk in autoexporters) {
    print(`// ---- ${rtk} ---------`);
    return autoexporters[rtk](rtkNode, options);
  } else {
    return `// console.log("unknown function '${rtk}'")`;
  }
};

const autoexportActions = (rtkNode, { reactImports }) => {
  const { name, identifiers, node } = rtkNode;
  const actionIdentifiers = [];
  for (const actionIdentifier of identifiers) {
    const actionIdentifiersL2 = esquery(
      node,
      `CallExpression  > * >Property[key.name=${actionIdentifier}]  > * > Property`,
    ).map((x) => x.key.name);
    if (actionIdentifiersL2.length === 0) actionIdentifiersL2.push("default");
    actionIdentifiers.push(
      ...actionIdentifiersL2.map((x) => (x === "default" ? actionIdentifier : x)),
    );
  }
  if (actionIdentifiers.length) {
    print(`export const { ${actionIdentifiers.join(", ")} } = ${name};`);
  } else {
    print(`export {${name} as __dont_use_me_${name} } // eslint friendly`);
  }
  nl();
  if (reactImports.createActionsHook) {
    print(`export const ${mkUse(name)} = createActionsHook( ${name} );`);
  }
  if (reactImports.createEntityActions) {
  }
  return dump();
};

const autoexportThunks = (rtkNode, { reactImports }) => {
  const { name, identifiers } = rtkNode;
  if (identifiers.length) {
    print(`export const { ${identifiers.join(", ")} } = ${name};`);
  } else {
    print(`export {${name} as __dont_use_me_${name} } // eslint friendly`);
  }
  nl();
  if (reactImports.createActionsHook) {
    print(`export const ${mkUse(name)} = createActionsHook( ${name} );`);
  }
  return dump();
};

const autoexportSelectors = (rtkNode, { reactImports }) => {
  // identique pour createSelectors et createSliceSelectors
  const { name, identifiers, rtk } = rtkNode;

  if (rtk === "createSliceSelectors" && reactImports.createEntitySelectors) {
    const entityIdentifiers = ["ids", "entities", "all", "total", "by_id"];
    print(
      `export const { ${entityIdentifiers.map(mkSelect).join(", ")} } = `,
      "createSliceSelectors(createEntitySelectors());",
    );

    if (reactImports.createSelectorHooks) {
      print(
        `export const { ${entityIdentifiers.map(mkUse).join(", ")} } = `,
        "createSelectorHooks(createSliceSelectors(createEntitySelectors()));",
      );
    }
  }

  if (!identifiers.length) {
    print(`export { ${name} as __dont_use_me_${name} } // eslint friendly`);
    nl();
    return dump();
  }

  print(`export const { ${identifiers.map(mkSelect).join(", ")} } = ${name};`);

  if (reactImports.createSelectorHooks) {
    print(`export const { ${identifiers.map(mkUse).join(", ")} } = createSelectorHooks(${name});`);
  }

  nl();
  return dump();
};

const autoexportEntitySelectors = (rtkNode, { reactImports }) => {
  const { name, node } = rtkNode;
  const literalArgs = esquery(node, `CallExpression  >  Literal `).map((x) => x.value);
  const entityName = literalArgs.at(0);
  const mkName = (def) => [entityName, def].filter(Boolean).join("_");
  const names = ["ids", "entities", "list", "count", "by_id"].map(mkName);
  print(`export const { ${names.map(mkSelect).join(", ")} } = ${name};`);

  if (reactImports.createSelectorHooks) {
    print(`export const { ${names.map(mkUse).join(", ")} } = createSelectorHooks(${name});`);
  }

  nl();
  return dump();
};

const autoexporters = {
  createActions: autoexportActions,
  createThunks: autoexportThunks,
  createSelectors: autoexportSelectors,
  createSliceSelectors: autoexportSelectors,
  createEntitySelectors: autoexportEntitySelectors,
};

const prettierOptions = {
  // TODO à lire depuis process.env.PWD
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: "all",
  arrowParens: "always",
  parser: "babel",
};

// import fs from 'fs';
// fs.readFile('../.prettierrc', 'utf8', (err, data) => {
//   if (err) throw new Error(err);
//   console.log(JSON.parse(data));
// })

const output = [];
/* eslint-disable no-unused-vars */
const print = (...line) => output.push(...line, "\n");
const write = (...line) => output.push(...line);
const dump = () => {
  const res = output.join("");
  output.length = 0;
  return prettier.format(res, prettierOptions);
};
const nl = () => output.push("\n");
/* eslint-enable no-unused-vars */

function toFile(filename, content, options = {}) {
  if (!options.overwrite && fs.existsSync(filename)) {
    if (options.verboseNoOverwrite) {
      console.log(`file '${filename} exists. No overwrite`);
    }
    if (options.fallbackExt) {
      toFile(`${filename}.${options.fallbackExt}`, content, {
        ...options,
        fallbackExt: null,
        overwrite: true,
      });
    }
  } else {
    if (options.verbose) {
      const message = `writing ${fs.existsSync(filename) ? "" : "new"} file '${filename}'`;
      console.log(message);
    }
    fs.writeFileSync(filename, content);
  }
}

function run(files, options) {
  const { write, debug } = options;
  for (const file of globSync(files, {
    ignore: ["node_modules/**"],
  })) {
    const destPath = process.env.PWD + `/${file}`;
    if (!fs.existsSync(destPath)) continue;
    if (fs.lstatSync(destPath).isDirectory()) {
      console.log("[TODO] scan dir:", destPath);
      continue;
    }
    let z;
    const source = fs.readFileSync(destPath, "utf8");
    try {
      z = Parser.extend(acornJsx()).parse(source, {
        ecmaVersion: "latest",
        sourceType: "module",
        ranges: true,
      });
    } catch (e) {
      console.log(file);
      throw e;
    }
    if (debug) parseNode(z, source);
    const reactImports = esquery(
      z,
      "ImportDeclaration > ImportSpecifier[imported.name=/createActionsHook|createSelectorHooks|createEntityActions/]",
    ).reduce((acc, node) => ({ ...acc, [node.imported.name]: true }), {});

    const rtkNodes = esquery(z, "Program > VariableDeclaration > VariableDeclarator")
      .filter((x) => x.id.type === "Identifier")
      .filter((x) => Object.keys(autoexporters).includes(x.init.callee?.name))
      .map((node) => ({
        name: node.id.name,
        rtk: node.init.callee.name,
        identifiers: esquery(
          node,
          `VariableDeclarator[id.name="${node.id.name}"] > CallExpression > * > Property`,
        ).map((x) => x.key.name || /* si computed */ source.slice(...x.key.range)),
        node,
        file,
      }));
    print(...rtkNodes.map((node) => autoexport(node, { reactImports })));
    const addons = dump();
    if (addons !== "") {
      // https://stackoverflow.com/questions/2575791/javascript-multiline-regexp-replace
      if (write) print(source.replace(/\/\/ RTK-AUTOEXPORT[\s\S]*/m, ""));
      if (write) print("// RTK-AUTOEXPORT");
      if (!write) print("// ", destPath);
      print(addons);
      if (write) {
        toFile(destPath, dump(), {
          overwrite: true,
        });
      } else {
        console.log(dump());
      }
    } else {
      console.log(destPath, ": no change");
    }
  }
}

program
  .name("rtk-export")
  .description("ajoute les exports dans les fichier crée avec rtk")
  .option("-w, --write", "replace le contenu des fichiers")
  .option("-d, --debug", "show the parsed tree")
  .argument("<filenames...>", "files to transform")
  .action(run);

program.parse();
