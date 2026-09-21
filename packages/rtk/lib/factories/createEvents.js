import { addDebug } from "../utils";
import { symbols } from "../constants";
import { createAction } from "@reduxjs/toolkit";
import { mkEvent } from "./formaters";

const prepareDynamic =
  (def) =>
  (...args) => ({ payload: def(...args) });

const prepareStatic = (def) => () => ({ payload: def });

const createPayloadCreator = (def) => {
  return typeof def === "function" ? prepareDynamic(def) : prepareStatic(def);
};

const createEventsFactory = (name) => (eventsMap) => {
  symbols.actions[name] = symbols.actions[name] || {};

  const events = {};

  Object.entries(eventsMap).forEach(([eventName, def]) => {
    const eventId = mkEvent(eventName);
    const eventType = `${name}/${eventId}`;
    events[eventId] = createAction(eventType, createPayloadCreator(def));

    symbols.actions[name][eventId] = eventType;
  });

  addDebug(name)("events", events);
  return events;
};

export { createEventsFactory };
