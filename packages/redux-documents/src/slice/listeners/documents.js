import { addListener } from '@lpr/rtk';
import { UNSUBSCRIBE_EVENT, CLOSE_EVENT, PERSIST_EVENT } from '../actions';
import { CREATE_EVENT } from '../actions';

import { selectSubscribed } from '../selectors';
import { unregister, getDocument, registerResource } from '../../documents/store';

export default [
  addListener(UNSUBSCRIBE_EVENT, ({ payload: { id } }, { getState, dispatch }) => {
    const doc = getDocument(id);
    const subscribed = selectSubscribed(getState(), doc);
    if (!subscribed) {
      doc.close();
    }
  }),
  addListener(CLOSE_EVENT, ({ payload: { id } }, { getState, dispatch }) => {
    const doc = getDocument(id);
    unregister(doc);
  }),
  addListener(PERSIST_EVENT, ({ payload: { id } }, { getState, dispatch }) => {
    const doc = getDocument(id);
    registerResource(doc);
    dispatch(CREATE_EVENT(doc.data));
  }),
];
