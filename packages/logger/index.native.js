import { logger as rnLogger, consoleTransport } from 'react-native-logs';

const state = {
  forceDebug: false,
};

export const forceDebug = (value) => {
  if (value === true || value === false) {
    state.forceDebug = value;
  } else {
    throw Error('Invalid argument');
  }
};

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    action: 4,
    end: 4,
  },
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
      action: 'greenBright',
      end: 'black',
    },
    extensionColors: {
      root: 'magenta',
      home: 'green',
    },
  },
};

const RN = rnLogger.createLogger(config);

// const url = 'http://192.168.3.230:12345';

export const isDevMode = __DEV__; // eslint-disable-line no-undef

export const stringify = (...args) =>
  args
    .map((x) => (typeof x === 'object' ? JSON.stringify(x, undefined, 2) : x))
    .map((x) => x.toString())
    .join(' ');

export const logger = (...args) => {
  (isDevMode || state.forceDebug) && RN.info(...args);
};

export default function createLogger(name) {
  const RN = rnLogger.createLogger({ ...config, enabledExtensions: [name] });

  return (...args) => RN.extend(name).info(...args);
}

export function fullLogger(name) {
  const RN = rnLogger.createLogger({ ...config, enabledExtensions: [name] });

  return name ? RN.extend(name) : RN;
}
