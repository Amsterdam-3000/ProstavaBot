import { Message } from "telegraf/typings/core/types/typegram";
import { SceneState } from "../types";

export class ObjectUtils {
    static stringifyActionData(action: string, value?: string, id?: string): string {
        return action + "|" + value + "|" + id;
    }
    static parseActionData(data: string | undefined) {
        if (!data) {
            return undefined;
        }
        const actionData = data.split("|");
        return {
            action: actionData[0],
            value: actionData[1],
            id: actionData[2]
        };
    }

    static initializeState(message: Message): SceneState {
        return {
            message: message
        };
    }
    static addActionToState(oldState: SceneState, actionData: string): SceneState {
        const newState = { ...oldState };
        newState.actionData = actionData;
        return newState;
    }
}
