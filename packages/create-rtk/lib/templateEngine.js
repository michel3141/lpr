import fs from 'node:fs';
import path from 'node:path';

export function renderTemplate(file, ctx) {
  const filePath = path.resolve('templates', `${file}.hbs`);

  let tpl = fs.readFileSync(filePath, 'utf-8');

  return tpl
    .replaceAll('{{sliceName}}', ctx.sliceName)
    .replaceAll('{{react}}', ctx.react ? 'true' : 'false');
}
