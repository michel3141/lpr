import fs from "fs";
import path from "path";
import { globSync } from "glob";

const convert = ({ exports, from, to }) =>
  Object.entries(exports)
    .map(([src, dst]) => [
      /* from */ path.resolve("/", from, src).slice(1),
      /* to */ path.resolve(to, dst),
    ])
    // plus spécifique en premier
    .toSorted(([a], [b]) => b.split("/").length - a.split("/").length);

export function importLibs(libSource = ".") {
  const libs = [];
  for (const packageFile of globSync(`${libSource}/*/package.json`)) {
    const to = path.dirname(packageFile);
    const { name: from, exports } = JSON.parse(fs.readFileSync(packageFile, "utf8"));
    if (exports) {
      console.log(`\x1b[41m·\x1b[0m ADD LIB '\x1b[32m${from}\x1b[0m' ➜ '\x1b[32m${to}\x1b[0m'`);
      libs.push({ exports, from, to });
    }
  }

  const alias = Object.fromEntries(libs.flatMap(convert));
  return alias;
}
