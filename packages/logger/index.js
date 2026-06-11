import isDevMode from '@lpr/is-dev-mode'

export const logger = (...args) => {
  isDevMode && console.log(...args);
  //  fetch(
  //    url +
  //      '/' +
  //      args
  //        .map((x) =>
  //          typeof x === 'object' ? JSON.stringify(x, undefined, 2) : x,
  //        )
  //        .map((x) => x.toString())
  //        .join(' ')
  //        .replaceAll(' ', '_'),
  //  ).catch(() => {});
};

export default function createLogger(name) {
  return (...args) => logger(`[${name}]`, ...args);
}

export function fullLogger(name) {
  const FL = name
    ? (...args) => logger(`%c[${name}]`, ...args)
    : (...args) => logger(...args);
  FL.action = (...args) => FL('background: #222; color: #bada55', ...args);
  FL.end = (arg) => FL('%c' + arg, 'background: #222; color: #777');
  return FL;
}
