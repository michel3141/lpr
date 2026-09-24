import fs from "fs";
import { globSync } from "glob";

const convert = ({ exports, from, to }) =>
  Object.entries(exports)
    .map(([k, v]) => [path.resolve("/", from, k).slice(1), path.resolve(to, v)])
    .toSorted(([a], [b]) => b.split("/").length - a.split("/").length);

export function importLibs(libSource = ".") {
  const libs = [];
  for (const packageFile of globSync(`${libSource}/*/package.json`)) {
    const to = path.dirname(packageFile);
    const { name: from, exports } = JSON.parse(fs.readFileSync(packageFile, "utf8"));
    if (exports) libs.push({ exports, from, to });
  }

  const alias = Object.fromEntries(libs.flatMap(convert));
  return alias;
}
