import { useCallback, useEffect, useMemo, useState, createContext, useContext } from "react";
import { useDocumentApi, useDocumentEvents } from "./actions";
import { useDocument } from "./selectors";

export const genId = () => crypto.randomUUID();

const useSubscriberId = (proposedSubscriberId) =>
  useState(() => proposedSubscriberId ?? genId())[0];

const useDocumentSubscription = (subscriberId, { updateOptions, saveOptions }) => {
  const { OPEN_EVENT, CLOSE_EVENT } = useDocumentEvents();

  useEffect(() => {
    OPEN_EVENT(subscriberId, { updateOptions, saveOptions });

    return () => {
      CLOSE_EVENT(subscriberId);
    };
  }, [OPEN_EVENT, CLOSE_EVENT, subscriberId, updateOptions, saveOptions]);
};

const useDocumentMethods = (model, subscriberId) => {
  const { create, open, find, findSingle, first, all, update, save, destroy } = useDocumentApi();

  const openDocument = useCallback((data) => open({ subscriberId, data }), [open, subscriberId]);

  const createDocument = useCallback(
    (params) => create({ subscriberId, model, params }),
    [create, subscriberId, model],
  );

  const updateDocument = useCallback(
    (changes) => update({ subscriberId, changes }),
    [update, subscriberId],
  );

  const saveDocument = useCallback(() => save({ subscriberId }), [save, subscriberId]);

  const destroyDocument = useCallback(() => destroy({ subscriberId }), [destroy, subscriberId]);

  const findDocument = useCallback(
    (id, fetcher) => find({ subscriberId, model, id, fetcher }),
    [find, subscriberId, model],
  );

  const findSingleDocument = useCallback(
    (fetcher) => findSingle({ subscriberId, model, fetcher }),
    [findSingle, subscriberId, model],
  );

  const firstDocument = useCallback(
    (fetcher) => first({ subscriberId, model, fetcher }),
    [first, subscriberId, model],
  );

  const allDocuments = useCallback(
    (fetcher) => all({ subscriberId, model, fetcher }),
    [all, subscriberId, model],
  );

  return useMemo(
    () => ({
      open: openDocument,
      update: updateDocument,
      save: saveDocument,
      destroy: destroyDocument,
      create: model && createDocument,
      find: model && findDocument,
      findSingle: model && findSingleDocument,
      first: model && firstDocument,
      all: model && allDocuments,
    }),
    [
      model,
      openDocument,
      createDocument,
      updateDocument,
      saveDocument,
      destroyDocument,
      findDocument,
      findSingleDocument,
      firstDocument,
      allDocuments,
    ],
  );
};

export const useApi = (param, options = {}, proposedSubscriberId) => {
  let model, data;
  if (typeof param === "string") {
    model = param;
  } else {
    data = param;
    model = data.klass.jsonapiType;
  }
  const [defaultData] = useState(() => options.data);
  const initialData = useMemo(() => data || defaultData, [data, defaultData]);
  const subscriberId = useSubscriberId(proposedSubscriberId);

  useDocumentSubscription(subscriberId, options);

  const document = useDocument(subscriberId, initialData);
  const methods = useDocumentMethods(model, subscriberId);

  const { open } = methods;
  useEffect(() => {
    if (!data) return;
    open(data);
  }, [open, data]);

  return useMemo(
    () => ({
      subscriberId,
      document,
      ...methods,
    }),
    [subscriberId, document, methods],
  );
};

export default function createApiProvider(param) {
  const Context = createContext(null);

  const Provider = ({ children, data, subscriberId, method: methodName, fetcher, id, options }) => {
    const api = useApi(data ?? param, options, subscriberId);
    const method = api[methodName];

    const fetchDocument = useCallback(() => {
      if (!method) return;

      switch (methodName) {
        case "find":
          return method(id, fetcher);
        case "findSingle":
        case "first":
        case "all":
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
      throw new Error("useApi must be used inside ApiProvider");
    }

    return api;
  };

  return { Provider, use };
}
