import { ERROR_CODE, LOCALE_REPLY } from "../commons/constants";
import { SceneState, UpdateContext } from "../types";

export const hideScene = async (ctx: UpdateContext) => {
    const sceneState = ctx.scene.state as SceneState;
    if (sceneState.message) {
        ctx.deleteMessage(sceneState.message.message_id);
    }
    ctx.scene.state = {};
};

export const forbidAction = async (ctx: UpdateContext) => {
    ctx.answerCbQuery(ctx.i18n.t(LOCALE_REPLY.ARE_GOING, { error_code: ERROR_CODE.ARE_GOING }));
};
