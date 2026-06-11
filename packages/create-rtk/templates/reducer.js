export function buildReducer(sliceName, options) {
  return `import rtk from '@lpr/rtk';
import { name } from './constants';
import {  } from './actions';
const { createReducer } = rtk(name);

const initialState = { };

export const reducer = createReducer(initialState, {
});
`;
}
