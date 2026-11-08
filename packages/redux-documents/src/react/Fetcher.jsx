import { useEffect, useRef } from 'react';
import { useDocumentApi, DESTROY_EVENT, CREATE_EVENT, SYNC_EVENT } from '../slice/actions';
import { useScope } from './Scope';

const ACTIONS = {
  [CREATE_EVENT.type]: 'create',
  [DESTROY_EVENT.type]: 'destroy',
  [SYNC_EVENT.type]: 'sync',
};

function useRequest({
  request,
  scope,
  shouldRefresh,
  pagination,
  onCount,
  requestOptions,
  enabled = true,
}) {
  const effectiveRequest = pagination
    ? {
        ...request,
        per: pagination.per,
        page: pagination.page,
        stats: {
          ...request?.stats,
          total: 'count',
        },
      }
    : (request ?? {});

  const response = useScope(enabled ? effectiveRequest : null, scope, requestOptions);
  const { mutate } = response;

  // le prédicat lit toujours la dernière version de shouldRefresh
  // sans obliger à se réabonner à chaque rendu
  const shouldRefreshRef = useRef(shouldRefresh);
  shouldRefreshRef.current = shouldRefresh;
  const listening = enabled && Boolean(shouldRefresh);

  const { listen } = useDocumentApi();
  useEffect(() => {
    if (!listening) return;
    const predicate = ({ type, payload }) => {
      const action = ACTIONS[type];
      return Boolean(action) && Boolean(shouldRefreshRef.current?.(action, payload));
    };
    return listen(predicate, () => mutate());
  }, [listen, listening, mutate]);

  const count = response.data?.meta?.stats?.total?.count;

  useEffect(() => {
    if (!enabled || count == null || !onCount) return;
    onCount(count);
  }, [enabled, count, onCount]);

  return {
    response,
    refresh: () => mutate(),
  };
}

/////////////////////////////////////////
/////////////////////////////////////////

function Results({ response, Obs, ...rest }) {
  if (!response) return null;

  if (response.error) {
    return <pre>{response.error.message}</pre>;
  }

  const payload = response.data;
  if (!payload?.data) return null;

  const { data, meta, raw } = payload;

  return [data].flat().map((datum) => (
    <Obs
      key={datum.id}
      data={datum}
      meta={meta}
      raw={raw}
      {...rest}
    />
  ));
}

/////////////////////////////////////////
/////////////////////////////////////////

function Request({ request, scope, shouldRefresh, requestOptions, ...rest }) {
  const { response, refresh } = useRequest({
    request,
    scope,
    shouldRefresh,
    requestOptions,
  });

  return (
    <Results
      response={response}
      reset={refresh}
      {...rest}
    />
  );
}

function PagedRequest({ request, usePager, scope, shouldRefresh, requestOptions, ...rest }) {
  const { per, page, updateCount, lastPage } = usePager();

  const common = { request, scope, requestOptions };
  const paginate = (p) => ({ per, page: p });

  const { response, refresh } = useRequest({
    ...common,
    pagination: paginate(page),
    onCount: updateCount,
    shouldRefresh,
  });

  // précharge la page précédente, la suivante et la dernière
  // (sans écoute: SWR les revalide quand on y arrive)
  const preload = (p) => p >= 1 && p <= (lastPage ?? Infinity) && p !== page;
  useRequest({ ...common, pagination: paginate(page - 1), enabled: preload(page - 1) });
  useRequest({ ...common, pagination: paginate(page + 1), enabled: preload(page + 1) });
  useRequest({
    ...common,
    pagination: paginate(lastPage),
    enabled: lastPage >= 1 && lastPage !== page && lastPage !== page + 1,
  });

  return (
    <Results
      response={response}
      reset={refresh}
      {...rest}
    />
  );
}

/////////////////////////////////////////
/////////////////////////////////////////

export function Index({ pager, request, fallbackData, shouldRefresh, ...props }) {
  return pager ? (
    <PagedRequest
      {...props}
      request={{ method: 'all', ...request }}
      usePager={pager}
      requestOptions={{ fallbackData }}
      shouldRefresh={shouldRefresh}
    />
  ) : (
    <Request
      {...props}
      request={request}
      requestOptions={{ fallbackData }}
      shouldRefresh={shouldRefresh}
    />
  );
}

export function Show({ request, fallbackData, ...props }) {
  return (
    <Request
      {...props}
      request={request}
      requestOptions={{ fallbackData }}
    />
  );
}
