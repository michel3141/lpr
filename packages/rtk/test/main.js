import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

//function XXXcreateThunk(type, def) {
//  const thunkCreator = (arg) => (dispatch, getState) => {
//    const thunk = def(arg);
//    const thunkApi = { dispatch, getState };
//    let response = undefined;
//    const action = (abandonned = false) => {
//      response = true;
//      if (!abandonned) {
//        dispatch({ type, payload });
//      }
//    };
//    thunk(action, thunkApi);
//    return response || dispatch({ type: `${type}/aborted` });
//  };
//  thunkCreator.type = type;
//  thunkCreator.match = (action) => action?.type === type;
//  thunkCreator.toString = () => type;
//  return thunkCreator;
//}

const $ = (def) => {
  const payloadCreator = (payload) => ({ payload: def(payload) });
  payloadCreator.isPayloadCreator = true;
  return payloadCreator;
};

function createThunk(type, def) {
  const thunkCreator = (arg) => (dispatch, getState) => {
    const thunk = def(arg);
    const thunkApi = { dispatch, getState };
    return thunk(action, thunkApi);
  };
  // thunkCreator.type = undefined;
  // thunkCreator.match = undefined;
  thunkCreator.toString = () => `dispatcher: ${type}`;
  return thunkCreator;
}

function typeOfAction(def) {
  if (def?.isPayloadCreator) {
    return "payloadCreator";
  }
  if (def?.constructor?.name === "AsyncFunction") {
    return "asyncThunk";
  }

  if ("function" === typeof def) {
    return "thunk"; // hopefully
  }

  console.warn(def);
  throw "type of action is unkwown";
}

const TEST = {
  thunk: async ({ x, y }, $) => {
    console.log("async 1", $.dispatch, $.getState);
  },
  dispatcher:
    (dispatch, getState) =>
    async ({ x, y }) => {
      console.log("do something with", getState());
    },
};

const events = {
  event: ({ x: { a, b }, y }) => ({ a, b, y }),
};

const actions = {};

Object.entries(TEST).forEach(([name, def]) => {
  console.log(name, typeOfAction(def));
  let action;
  const actionType = typeOfAction(def);
  switch (actionType) {
    case "asyncThunk":
      action = createAsyncThunk(name, def);
      break;
    case "thunk":
      action = createThunk(name, def);
      break;
    case "payloadCreator":
      action = createAction(name, (payload) => ({ payload: def(payload, () => "x") }));
      break;
    default:
      throw Error(`action type unknown : '${actionType}'`);
  }
  actions[name] = action;
});

console.log("****** RESULTS ********");
Object.entries(actions).forEach(([name, action]) => {
  console.log(name, action, action({ x: { a: "a", b: "b" }, y: "y" }));
});
window.actions = actions;

//async ({x,y}, $)=>{  $.dispatch, $.getState,return}               => T
//({x,y})=>($$, $)=>{...;$$({x,y})/$$.canceled()/$$(action({})); }            => A
//(x,y)=>({x, y})                                            => E
//
//export function createAction(type: string, prepareAction?: Function): any {
//  function actionCreator(...args: any[]) {
//    if (prepareAction) {
//      let prepared = prepareAction(...args)
//      if (!prepared) {
//        throw new Error('prepareAction did not return an object')
//      }
//
//      return { // pour un event sinon ()=>
//        type,
//        payload: prepared.payload,
//        ...('meta' in prepared && { meta: prepared.meta }),
//        ...('error' in prepared && { error: prepared.error }),
//      }
//    }
//    return { type, payload: args[0] }
//  }
//
//  actionCreator.toString = () => `${type}`
//
//  actionCreator.type = type
//
//  actionCreator.match = (action: unknown): action is PayloadAction =>
//    isAction(action) && action.type === type
//
//  return actionCreator
//}
//
//T on peut ajouter toString=fulfilled pour les thunkAsync (reducer ? avait été décidé mauvaise idée)
//E => createAction avec prepareAction limitée
//A => comme createAction mais return un thunk
//      + throw si $$ n'est pas appelé
//
//plus d'actions imbriquées comme avant. à la rigueur comme : https://redux-actions.js.org/api/createaction#createactionsactionmap
//emmerdant pour les useActionsHook
//
//

import rtk from "../lib";
const { createEvents } = rtk("test-slice");

window.E = createEvents({
  ab: (x) => x,
  az: "toto",
  ty: null,
  wx: ({ x: { a, b }, y }) => ({ y, a, b }),
});
