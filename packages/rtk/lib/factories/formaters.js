import { underscore, constantify, camelize } from "inflected";

export const mkEvent = (eventName) => constantify(`${eventName}_EVENT`);

export const mkAction = (actionName) => camelize(`${actionName}`, false);
