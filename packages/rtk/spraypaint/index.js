import rtk from '../lib';
const log = () => {};
export const serialize = (
  resource,
  done = {} // pass includes instead of done ?
) =>
  Object.entries(resource.relationships).reduce(
    (acc, [name, obj]) => {
      if (obj === undefined || obj === null) {
        return { ...acc, [name]: obj };
      } else if (Array.isArray(obj)) {
        return { ...acc, [name]: obj.map((x) => serialize(x, done)) };
      } else {
        const uuid = `${obj.klass.jsonapiType}-${obj.id}`;
        if (!done[uuid]) {
          done[uuid] = serialize(obj, {
            ...done,
            [uuid]: `self-ref: ${uuid}`,
          });
        } else {
          log('DONE', uuid);
        }
        return {
          ...acc,
          [name]: done[uuid],
        };
      }
    },
    log('ATTR', `${resource.klass.jsonapiType}-${resource.id}`) ||
      resource.attributes
  );

export const reduceResource =
  () =>
  (state, { payload }) => {
    state.last = payload.id;
    state.entities[payload.id] = payload;
    // TODO state.ids ??
  };
export const reduceResources =
  () =>
  (state, { payload }) => {
    while (state.ids.length) {
      delete state.entities[state.ids.shift()];
    }
    payload.forEach((resource) => (state.entities[resource.id] = resource));
    state.ids = Object.keys(state.entities);
  };

const spraypaintRtk = (name) => {
  const { createThunks: createBaseThunks } = rtk(name);
  return {
    initialState: {
      last: null,
      ids: [],
      entities: {},
    },

    spraypaintReducer: {
      [`${name}/create/fulfilled`]: reduceResource(),
      [`${name}/find/fulfilled`]: reduceResource(),
      [`${name}/refresh/fulfilled`]: reduceResource(),
      [`${name}/update/fulfilled`]: reduceResource(),
    },
    selectLast: [
      (state) => state[name].entities,
      (state) => state[name].last,
      (entities, last) => entities[last]?.dup(),
    ],
    selectById: [
      (state, { id }) => state.entities[name][id],
      (resource) => resource?.dup(),
    ],
    selectCollection: [
      (state) => state[name].ids,
      (state) => state[name].entities,
      (ids, entities) => ids.map((id) => entities[id]?.dup()),
    ],

    createSpraypaintThunks: ({ selectEndpoint, saveOpts, selectResource }) =>
      createBaseThunks({
        create: (attributes = {}, { getState, dispatch }) => {
          const Endpoint = selectEndpoint(getState());
          return new Endpoint(attributes).commit(saveOpts);
        },
        update: (attributes = {}, { getState, dispatch }) => {
          const resource = selectResource(getState(), attributes);
          resource.updateAttributes(attributes);
          return resource.commit(saveOpts);
        },
        refresh: (attributes = {}, { getState, dispatch }) => {
          const resource = selectResource(getState(), attributes);
          return resource.updateAttributes(attributes);
        },
        find: async (id = '0', { getState, dispatch }) => {
          const Endpoint = selectEndpoint(getState());
          return (await Endpoint.find(id)).data;
        },
      }),
  };
};

export default spraypaintRtk;
