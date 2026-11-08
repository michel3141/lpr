import { useSlice } from '@lpr/rtk/react';

import * as constants from './constants';

import * as selectors from './selectors';
import * as actions from './actions';
import { reducer } from './reducer';
import './listeners';

export { constants, selectors, actions, reducer };
export const useLocalStorage = () => useSlice({ actions, selectors });

export const LocalStorage = ({ failsafe, children }) => {
  const isReady = useLocalStorage().useIsReady();
  return isReady ? children : failsafe;
};

export default reducer;
