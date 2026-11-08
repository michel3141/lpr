#!/usr/bin/env node
import { program } from 'commander';
import esquery from 'esquery';
import { Parser } from 'acorn';
import fs from 'fs';
import { globSync } from 'glob';

async function run(name, options) {
  const deps = {};
  const files = globSync(name, { ignore: 'node_modules/**' });
  for (const file of files) {
    let z;
    const source = fs.readFileSync(file, 'utf8');
    try {
      z = Parser.parse(source, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ranges: true,
      });
    } catch (e) {
      console.log(file);
      throw e;
    }
    const rtkNodes = esquery(z, 'CallExpression').filter(
      (node) =>
        node.callee.name === 'addListener' ||
        node.callee.name === 'onStorageReady' ||
        node.callee.name === 'onBoot'
    );
    for (const node of rtkNodes) {
      const identifiers = [];
      const dispatches = [];
      if (node.callee.name === 'addListener') {
        if (node.arguments[0].type === 'Identifier') {
          identifiers.push(node.arguments[0].name);
        }
        if (node.arguments[0].type === 'ArrayExpression') {
          identifiers.push(...node.arguments[0].elements.map((elm) => elm.name));
        }
        dispatches.push(
          ...esquery(node.arguments[1], 'CallExpression')
            .filter((node) => node.callee.name === 'dispatch')
            .map((node) => node.arguments[0].callee.name)
        );
      }
      if (node.callee.name === 'onStorageReady' || node.callee.name === 'onBoot') {
        identifiers.push(node.callee.name);
        dispatches.push(
          ...esquery(node.arguments[0], 'CallExpression')
            .filter((node) => node.callee.name === 'dispatch')
            .map((node) => node.arguments[0].callee.name)
        );
      }

      for (const identifier of identifiers) {
        for (const dispatch of dispatches) {
          deps[file] = deps[file] || {};
          deps[file][identifier] = deps[file][identifier] || {};
          deps[file][identifier][dispatch] = true;
        }
      }
    }
  }
  for (const file in deps) {
    for (const identifier in deps[file]) {
      for (const dispatch in deps[file][identifier]) {
        console.log(file, ':', identifier, '>', dispatch);
      }
    }
  }
}

program
  .name('rtk-listeners')
  .description('affiche les dépendances des listeners')
  .argument('<files>', 'files to parse')
  .action(run);

program.parse();
