import { CHECKBOX } from "./constants";

//Select Value
export const selectValue = (value: string): string => `${value} ${CHECKBOX.SELECTED}`;
export const unselectValue = (value: string): string => `${value} ${CHECKBOX.NOT_SELECTED}`;

//Parse Action Data
export const stringifyActionData = (action: string, value: string): string =>
    JSON.stringify({ action: action, value: value });
export const parseActionData = (data: string): { action: string; value: string } => JSON.parse(data);
