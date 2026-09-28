import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDocumentApi, useDocumentEvents } from '../src/actions';
import { useDocument } from '../src/selectors';

const genId = () => crypto.randomUUID();

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

const useDocumentMethods = (endpoint, subscriberId) => {
  const { create, open, find, findSingle, first, all, update, save, refetch, destroy } =
    useDocumentApi();

  const openDocument = useCallback((data) => open({ subscriberId, data }), [open, subscriberId]);

  const createDocument = useCallback(
    (params) => create({ subscriberId, endpoint, params }),
    [create, subscriberId, endpoint]
  );

  const updateDocument = useCallback(
    (changes) => update({ subscriberId, changes }),
    [update, subscriberId]
  );

  const saveDocument = useCallback(() => save({ subscriberId }), [save, subscriberId]);

  const refetchDocument = useCallback(() => refetch({ subscriberId }), [refetch, subscriberId]);

  const destroyDocument = useCallback(() => destroy({ subscriberId }), [destroy, subscriberId]);

  const findDocument = useCallback(
    (id, fetcher) => find({ subscriberId, endpoint, id, fetcher }),
    [find, subscriberId, endpoint]
  );

  const findSingleDocument = useCallback(
    (fetcher) => findSingle({ subscriberId, endpoint, fetcher }),
    [findSingle, subscriberId, endpoint]
  );

  const firstDocument = useCallback(
    (fetcher) => first({ subscriberId, endpoint, fetcher }),
    [first, subscriberId, endpoint]
  );

  const allDocuments = useCallback(
    (fetcher) => all({ subscriberId, endpoint, fetcher }),
    [all, subscriberId, endpoint]
  );

  return useMemo(
    () => ({
      open: openDocument,
      update: updateDocument,
      save: saveDocument,
      refetch: refetchDocument,
      destroy: destroyDocument,
      create: endpoint && createDocument,
      find: endpoint && findDocument,
      findSingle: endpoint && findSingleDocument,
      first: endpoint && firstDocument,
      all: endpoint && allDocuments,
    }),
    [
      endpoint,
      openDocument,
      createDocument,
      updateDocument,
      saveDocument,
      refetchDocument,
      destroyDocument,
      findDocument,
      findSingleDocument,
      firstDocument,
      allDocuments,
    ]
  );
};

export const useApi = (param, options = {}, proposedSubscriberId) => {
  let endpoint, data;
  if (typeof param === 'string') {
    endpoint = param;
  } else {
    data = param;
    endpoint = data.klass.jsonapiType;
  }
  const [defaultData] = useState(() => options.data);
  const initialData = useMemo(() => data || defaultData, [data, defaultData]);
  const subscriberId = useSubscriberId(proposedSubscriberId);

  useDocumentSubscription(subscriberId, options);

  const document = useDocument(subscriberId, initialData);
  const methods = useDocumentMethods(endpoint, subscriberId);

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
    [subscriberId, document, methods]
  );
};
