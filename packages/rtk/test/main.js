import rtk from "../lib";
import { createSelectorHooks, createActionsHook } from "../react";
// import { createEntityActions } from "../";
console.log("RTK", Object.keys(rtk("slice-name")));
const { createActions, createSelectors, createSliceSelectors, addListener, createEntitySelectors } =
  rtk("slice-name");

try {
  addListener();
} catch (e) {
  console.warn(e.message);
}
const actions = createActions({
  test: () => ({ payload: "coucou" }),
  multiple: {
    //    default: (payload) => ({ payload }),
    a: () => ({ payload: "a" }),
    b: () => ({ payload: "b" }),
    x: () => ({ payload: "WTF" }),
  },
});
console.log("ACTIONS", Object.keys(actions));
console.log(
  "ACTIONS",
  Object.values(actions).map((a) => a.toString()),
);

Object.entries(actions).forEach(([name, action]) => {
  try {
    console.log(name, action("test-payload"));
  } catch (e) {
    console.warn(name, e.message);
  }
});

const selectors = createSelectors({
  test: (state) => state.x,
  test2: (state) => state.x + state["slice-name"].x,
  test3: [(state) => state.x, (state) => state["slice-name"].x, (a, b) => a + b],
});
const localSelectors = createSliceSelectors({
  testl: (state) => state.x,
});

const entitySelectors2 = createEntitySelectors();
const entitySelectors = createEntitySelectors("book");

const STATE = {
  x: 45,
  "slice-name": {
    ids: ["5", "2"],
    entities: {
      2: { id: "2", name: "name-1" },
      5: { id: "5", name: "name-2" },
    },
    x: 27,
  },
};
console.log("SELECTORS___", selectors);
console.log("LOCAL__SEL__", localSelectors);
console.log("SELECT_TEST_", selectors.selectTest(STATE));
console.log("SELECT_TEST2", selectors.selectTest2(STATE));
console.log("SELECT_TEST3", selectors.selectTest3(STATE));
console.log("LOCAL__TESTL", localSelectors.selectTestl(STATE));

console.log("ENTITY", Object.keys(entitySelectors));
console.log("ENTITY_IDS", createEntitySelectors().selectIds(STATE));
console.log("ENTITY_ENT", createEntitySelectors().selectEntities(STATE));
console.log("ENTITY_ALL", createEntitySelectors().selectList(STATE));
console.log("ENTITY_TOT", createEntitySelectors().selectCount(STATE));
console.log("ENTITY_5", createEntitySelectors().selectById(STATE, "5"));

export const { selectIds } = createEntitySelectors();
