#!/usr/bin/env node
import { program } from 'commander';
import { camelize } from 'inflected';
import prettier from '@prettier/sync';
import fs from 'fs';

const prettierOptions = {
  // TODO à lire depuis process.env.PWD
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  parser: 'babel',
};

// import fs from 'fs';
// fs.readFile('../.prettierrc', 'utf8', (err, data) => {
//   if (err) throw new Error(err);
//   console.log(JSON.parse(data));
// })

const output = [];
const print = (...line) => output.push(...line, '\n');
const write = (...line) => output.push(...line);
const dump = () => {
  const res = output.join('');
  output.length = 0;
  return prettier.format(res, prettierOptions);
};
const nl = () => output.push('\n');

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
      const message = `writing ${
        fs.existsSync(filename) ? '' : 'new'
      } file '${filename}'`;
      console.log(message);
    }
    fs.writeFileSync(filename, content);
  }
}

// eslint-disable-next-line camelcase
function build_index(name, options) {
  // useSlice est déprécié
  // if (!options.react) write('// ');
  // print("import { useSlice } from '@lpr/rtk/react';");
  nl();
  print("import * as constants from './constants';");
  nl();
  print("import * as selectors from './selectors';");
  print("import * as actions from './actions';");
  print("import './listeners';");
  print("import {reducer} from './reducer';");
  nl();
  print('export {constants, selectors, actions, reducer};');
  // if (!options.react) write('// ');
  // print(
  //   `export const use${camelize(name)} = () => useSlice({actions, selectors});`
  // );
  return dump();
}

// eslint-disable-next-line camelcase
function build_listeners() {
  print("// import { onBoot, addListener } from '@lpr/rtk';");
  nl();
  print('// onBoot(({ payload }, { dispatch, getState })=>{});');
  print('// addListener(action, ({ payload }, { dispatch, getState })=>{});');

  return dump();
}

// eslint-disable-next-line camelcase
function build_reducer() {
  print("import rtk /* , {set, update } */ from '@lpr/rtk';");
  print("import { name } from './constants';");
  print('const { createReducer } = rtk(name);');
  nl();
  print('const initialState = {};');
  nl();
  print('export const reducer = createReducer(initialState, {});');

  return dump();
}

// eslint-disable-next-line camelcase
function build_actions(name, options) {
  print("import rtk /* , { no_, _ } */ from '@lpr/rtk';");
  if (!options.react) write('// ');
  print("import { createActionsHook } from '@lpr/rtk/react';");
  print("import { name } from './constants';");
  print('const { createActions, createThunks } = rtk(name);');
  nl();
  print(`const ${camelize(name, false)}Actions = createActions({});`);
  nl();
  print(`const ${camelize(name, false)}Api = createThunks({});`);

  return dump();
}

// eslint-disable-next-line camelcase
function build_selectors(name, options) {
  print("import rtk /* , { select } */ from '@lpr/rtk';");
  if (!options.react) write('// ');
  print("import { createSelectorHooks } from '@lpr/rtk/react';");
  print("import { name } from './constants';");
  print('const { createSelectors } = rtk(name);');
  nl();
  print('const selectors = createSelectors({});');

  return dump();
}

// eslint-disable-next-line camelcase
function build_constants(name) {
  print(`export const name = '${name}'`);
  nl();

  return dump();
}

function run(name, cwd, options) {
  const { write, /* monoFile , */ overwrite } = options;
  // const destPath = process.env.PWD + `/${name}`;
  // const destPath = process.cwd() + `/${name}`;
  // const destPath = (process.env.OLDPWD || process.env.PWD || process.cwd()) + `/${name}`;
  const destPath = (cwd || process.cwd()) + `/${name}`;
  name = name.replace(/.*\//, '');
  if (write) {
    const writeOptions = {
      verbose: true,
      verboseNoOverride: false,
    };

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath);
    }

    toFile(`${destPath}/index.js`, build_index(name, options), {
      ...writeOptions,
      overwrite,
    });
    toFile(`${destPath}/constants.js`, build_constants(name, options), {
      ...writeOptions,
    });
    toFile(`${destPath}/selectors.js`, build_selectors(name, options), {
      ...writeOptions,
    });
    toFile(`${destPath}/actions.js`, build_actions(name, options), {
      ...writeOptions,
    });
    toFile(`${destPath}/reducer.js`, build_reducer(name, options), {
      ...writeOptions,
    });
    toFile(`${destPath}/listeners.js`, build_listeners(name, options), {
      ...writeOptions,
    });
  } else {
    console.log();
    console.log('/*');
    console.log(' * index.js');
    console.log(' */');
    console.log();
    console.log(build_index(name, options));

    console.log();
    console.log('/*');
    console.log(' * constants.js');
    console.log(' */');
    console.log();
    console.log(build_constants(name, options));

    console.log();
    console.log('/*');
    console.log(' * selectors.js');
    console.log(' */');
    console.log();
    console.log(build_selectors(name, options));

    console.log();
    console.log('/*');
    console.log(' * actions.js');
    console.log(' */');
    console.log();
    console.log(build_actions(name, options));

    console.log();
    console.log('/*');
    console.log(' * reducer.js');
    console.log(' */');
    console.log();
    console.log(build_reducer(name, options));

    console.log();
    console.log('/*');
    console.log(' * listeners.js');
    console.log(' */');
    console.log();
    console.log(build_listeners(name, options));

    console.log();
    console.log('/*');
    console.log(' * Destination :');
    console.log(' */');
    console.log();
    console.log(destPath);
  }
}

program
  .name('rtk-slice')
  .description('génère un dossier slice dans /features')
  .option('-m, --mono-file', 'toute la slice est définie dans index.js [TODO]')
  .option('-w, --write', 'write to ./name')
  .option('-W, --overwrite', 'overwrites index.js')
  .option('-r, --react', 'uncomment react-hook creation')
  .argument('<name>', 'slice name')
  .argument(
    '<cwd>',
    'dossier de destination ; $(pwd) est une bonne idée ; absolu ou relatif à la racice du projet '
  )
  .action(run);

program.parse();
