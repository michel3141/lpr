# install

yarn add git+ssh://git@git.boloco.fr:npm/rtk#1.0.1
ou
yarn add ssh://git@git.boloco.fr:npm/rtk#1.0.1

# rollup-plugin

pour l'instant pas d'install automatique
cp node_modules/rtk/lib/rollup-plugin-rtk-autoexport.js src/ ## <-- dans le dossier contenant vite.config.js

vite.config.js
import rtkAutoexport from './rollup-plugin-rtk-autoexport';

    export default defineConfig({
      resolve: {
        alias: {
          '~': path.resolve(__dirname, './'),
        },
      },
      plugins: [react(), rtkAutoexport()],
    });

# publication

pnpm build
bump p|m|M
pnpm publish
~
