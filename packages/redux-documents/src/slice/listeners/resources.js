import { addListener } from '@lpr/rtk';
import { DELETE_EVENT, REFRESH_EVENT } from '../actions';
import { DESTROY_EVENT, SYNC_EVENT } from '../actions';

import { getResources } from '../../documents/store';

export default [
  addListener(DESTROY_EVENT, ({ payload: { resourceId } }, { getState, dispatch }) => {
    getResources(resourceId).forEach((doc) => dispatch(DELETE_EVENT(doc)));
  }),
  addListener(SYNC_EVENT, ({ payload: { resourceId, diff } }, { getState, dispatch }) => {
    getResources(resourceId).forEach((doc) => dispatch(REFRESH_EVENT(doc, diff)));
  }),
];
