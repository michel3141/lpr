import rtk from "../lib";
console.log("RTK", Object.keys(rtk("slice-name")));
const { createActions, addListener } = rtk("slice-name");
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
