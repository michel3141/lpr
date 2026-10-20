import { useEffect, useState } from 'react';
import { useDocumentApi } from '../slice/actions';
import { useDocument } from '../slice/selectors';

const useSubscribe = (doc) => {
  const { subscribe, unsubscribe } = useDocumentApi();
  useEffect(() => {
    subscribe({ doc });
    return () => unsubscribe({ doc });
  }, [doc, subscribe, unsubscribe]);
  return useDocument(doc);
};

const Watch =
  (client, Controller, Context) =>
  ({ data, /* raw */ meta, ...rest }) => {
    const [doc] = useState(() => client.adapt(data));
    const docState = useSubscribe(doc);
    const context = {
      data: {
        ...doc.data.attributes,
        ...doc.data.relationships,
        errors: doc.data.errors,
      },
      meta: {
        meta, // est-ce que data.meta exists aussi ??
        modify: (changes, options) => doc.modify(changes, options),
        commit: (options) => doc.commit(options),
        destroy: () => doc.destroy(),
        dirty: doc.data.isDirty(),
        persisted: doc.data.isPersisted,
        committing: doc.committing,
        error: doc.error,
      },
    };
    return (
      <Context value={context}>
        <Controller
          doc={doc}
          {...docState}
          {...rest}
        />
      </Context>
    );
  };

export { Watch };
