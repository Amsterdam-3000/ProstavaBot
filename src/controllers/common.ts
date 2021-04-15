import { CODE } from "../constants";
import { LocaleUtils, TelegramUtils } from "../utils";
import { SceneState, UpdateContext } from "../types";

export class CommonController {
    static enterScene(scene: string) {
        return async (ctx: UpdateContext) => ctx.scene.enter(scene);
    }
    static async hideScene(ctx: UpdateContext) {
        const sceneState = TelegramUtils.getSceneState(ctx);
        if (sceneState.message) {
            ctx.deleteMessage(sceneState.message.message_id);
        }
        TelegramUtils.setSceneStateToContext(ctx, {});
    }

    static showActionCbMessage(action: string) {
        return async (ctx: UpdateContext) => ctx.answerCbQuery(LocaleUtils.getActionReplyText(ctx.i18n, action));
    }
    static async catchUnknownAction(ctx: UpdateContext) {
        return ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.ARE_GOING));
    }
}
