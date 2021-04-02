import { CallbackQuery } from "telegraf/typings/core/types/typegram";
import { ERROR_CODE, LOCALE_REPLY } from "../commons/constants";
import { addActionToState, parseActionData } from "../commons/utils";
import { SceneState, UpdateContext } from "../types";

export const saveActionDataToState = async (ctx: UpdateContext, next: Function) => {
    const dataCallbackQuery = ctx.callbackQuery as CallbackQuery.DataCallbackQuery;
    const sceneState = ctx.scene.state as SceneState;
    ctx.scene.state = addActionToState(sceneState, dataCallbackQuery.data);
    return next();
};

export const checkStateAction = (action: string) => async (ctx: UpdateContext, next: Function) => {
    const sceneState = ctx.scene.state as SceneState;
    if (!sceneState.actionData || action !== parseActionData(sceneState.actionData).action) {
        return;
    }
    return next();
};

export const isMessageOrigin = async (ctx: UpdateContext, next: Function) => {
    const sceneState = ctx.scene.state as SceneState;
    const message = ctx.message || ctx.callbackQuery.message;
    if (!sceneState.message || sceneState.message.message_id === message.message_id) {
        return next();
    }
    return ctx.answerCbQuery(ctx.i18n.t(LOCALE_REPLY.ARE_GOING, { error_code: ERROR_CODE.ARE_GOING }));
};
