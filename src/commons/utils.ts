import { Message } from "telegraf/typings/core/types/typegram";
import { SceneState } from "../types";
import { CHECKBOX_CODE } from "./constants";

//Select Value
export const selectValue = (value: string): string => `${value} ${CHECKBOX_CODE.SELECTED}`;
export const unselectValue = (value: string): string => `${value} ${CHECKBOX_CODE.NOT_SELECTED}`;

//Parse Action Data
export const stringifyActionData = (action: string, value?: string): string =>
    JSON.stringify({ action: action, value: value });
export const parseActionData = (data: string): { action: string; value?: string;} => JSON.parse(data);

//Set Scene State
export const setNewMessageState = (message: Message): SceneState => {
    return {
        message: message
    };
};
export const addActionToState = (oldState: SceneState, actionData: string): SceneState => {
    let newState = oldState;
    newState.actionData = actionData;
    return newState;
};

//Emoji Regex
export const emojiRegex = require("emoji-regex");
