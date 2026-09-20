import { addDebug } from "../utils";
import { constantify, camelize } from "inflected";
import { symbols } from "../constants";
import { createAction } from "@reduxjs/toolkit";

const mkEvent = (eventName) => camelize(`${eventName}Event`, false);

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
    const eventType = `${name}/${constantify(eventId)}`;
    events[eventId] = createAction(eventType, createPayloadCreator(def));

    symbols.actions[name][eventId] = eventType;
  });

  addDebug(name)("events", events);
  return events;
};

export { createEventsFactory };
