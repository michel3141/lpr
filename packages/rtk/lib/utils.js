import isDevMode from "@lpr/is-dev-mode";

export const addDebug = (name) => (type, objects) => {
  if (isDevMode && Object.keys(objects).length) {
    console.info(type.at(0).toUpperCase(), "/", name, ":", Object.keys(objects).join(", "));
    window[type] = window[type] || {};
    window[type][name] = window[type][name] || {};
    window[type][name] = { ...window[type][name], ...objects };
  }
};

export const sup0 = (message) => {
  throw Error(`[depuis 1.1.1] ${message}`);
};

export const join_ = (...def) => def.filter(Boolean).join("_");
