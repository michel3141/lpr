import { camelize, constantize } from "@lpr/helpers-text";


export const mkEvent = (eventName) => constantize(`${eventName}_EVENT`);

export const mkAction = (actionName) => camelize(`${actionName}`);
