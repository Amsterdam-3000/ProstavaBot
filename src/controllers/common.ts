import { LocaleUtils, TelegramUtils } from "../utils";
import { UpdateContext } from "../types";

export class CommonController {
    static enterScene(scene: string) {
        return async (ctx: UpdateContext) => ctx.scene.enter(scene);
    }
    static async hideScene(ctx: UpdateContext) {
        const sceneState = TelegramUtils.getSceneState(ctx);
        if (sceneState.message) {
            ctx.deleteMessage(sceneState.message.message_id).catch((err) => console.log(err));
        }
        TelegramUtils.setSceneStateToContext(ctx, {});
    }

    static showActionCbMessage(action: string, value?: string) {
        return async (ctx: UpdateContext) => ctx.answerCbQuery(LocaleUtils.getActionReplyText(ctx.i18n, action, value));
    }
}
