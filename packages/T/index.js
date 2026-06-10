function createT(defaultLang = 'fr') {
  const TT = {};

  return function T(message, lang = defaultLang) {
    if (Array.isArray(message)) {
      // pour les appels de la forme
      // T̀`mon message`
      if (message.length !== 1) {
        throw Error('T: Bad call');
      }
      message = message.at(0);
    }
    TT[lang] = TT[lang] || {};
    if (typeof message === 'string') {
      if (message in TT[lang]) {
        return TT[lang][message];
      } else {
        return message;
      }
    } else {
      Object.assign(TT[lang], message);
    }
  };
}

const T = createT();
export { T };

export default createT;
