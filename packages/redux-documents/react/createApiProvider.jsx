import { useCallback, useEffect, createContext, useContext } from 'react';
import { useApi } from './hook';

export default function createApiProvider(param) {
  const Context = createContext(null);

  const Provider = ({ children, data, subscriberId, method: methodName, fetcher, id, options }) => {
    const api = useApi(data ?? param, options, subscriberId);
    const method = api[methodName];

    const fetchDocument = useCallback(() => {
      if (!method) return;

      switch (methodName) {
        case 'find':
          return method(id, fetcher);
        case 'findSingle':
        case 'first':
        case 'all':
          return method(fetcher);
        default:
          throw new Error(`Invalid provider method "${methodName}"`);
      }
    }, [method, methodName, fetcher, id]);

    useEffect(() => {
      fetchDocument();
    }, [fetchDocument]);

    return <Context.Provider value={api}>{children}</Context.Provider>;
  };

  const use = () => {
    const api = useContext(Context);

    if (!api) {
      throw new Error('useApi must be used inside ApiProvider');
    }

    return api;
  };

  return { Provider, use };
}
