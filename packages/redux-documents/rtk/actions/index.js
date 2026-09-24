import { createAction } from "@reduxjs/toolkit";

export const bootType = "rtk/@@boot";

export const boot = createAction(bootType);
