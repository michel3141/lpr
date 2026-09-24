import { onBoot, addListener } from "../rtk";
import {
  update,
  destroy,
  // eslint-disable-next-line no-unused-vars  ## TODO en attendant de géré save
  save,
  fetch,
  RESOURCES_EVENT,
  UPDATE_EVENT,
  CLOSE_EVENT,
} from "./actions";

// eslint-disable-next-line no-unused-vars  ## TODO en attendant de géré save
import { selectUpdateOptions, selectLinks, selectSaveOptions } from "./selectors";
import { onDocument, getDocument, getRequest, deleteLink } from "./documentStore";

export default [
  onBoot((_, { getState, dispatch }) => {
    onDocument({
      onNeedFetch: (subscriberId) => {
        const request = getRequest(subscriberId);
        dispatch(fetch({ subscriberId, request }));
      },
      onUpdate: (subscriberId, resourceId, changes, prev) =>
        dispatch(UPDATE_EVENT(subscriberId, changes)),
      onDelete: (subscriberId, prev) => dispatch(CLOSE_EVENT(subscriberId)),
      onSet: (subscriberId) => {
        const doc = getDocument(subscriberId);
        dispatch(RESOURCES_EVENT(subscriberId, doc.resourceIds));
      },
    });
  }),
  addListener(
    update.fulfilled,
    (
      { payload: { subscriberId, changes = {} } },
      { dispatch, getState, cancelActiveListeners, delay },
    ) => {
      /*
       * TODO
       * selon les options dans selectUpdateOptions
       * faire un enregistrement sur le serveur, maintenant,
       * en différé avec débounce, pas du tout.
       *
       * Et si le coeur m'en dit, mettre d'autres options ou d'atres actions
       * pour que update soit optimiste, pessimiste, ou local
       */
    },
  ),

  addListener(destroy.fulfilled, ({ payload: { subscriberId } }, { dispatch, getState }) => {
    const { resourceIds } = getDocument(subscriberId);
    const links = resourceIds.flatMap((resourceId) => selectLinks(getState(), { resourceId }));
    links.forEach(deleteLink);
  }),
];

// + une logique d'ajout de listener sur OPEN et de suppression sur CLOSE
//
// const createUpdateListener = (subscriberId) =>
//   addListener({
//     actionCreator: update.fulfilled,
//     predicate: (action) =>
//       action.payload.subscriberId === subscriberId,
//
//     effect: async (_, { dispatch, getState, delay, signal }) => {
//       const options = selectUpdateOptions(getState(), subscriberId);
//
//       if (options.save === false) return;
//
//       if (options.debounce) {
//         await delay(options.debounce, { signal });
//       }
//
//       dispatch(save({ subscriberId }));
//     },
//   });
