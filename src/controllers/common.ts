import { LocaleUtils, TelegramUtils } from "../utils";
import { UpdateContext } from "../types";

export class CommonController {
    static enterScene(scene: string) {
        return async (ctx: UpdateContext): Promise<void> => {
            const command = TelegramUtils.getMessageCommand(ctx) || TelegramUtils.getSceneCommand(ctx);
            //TODO ID for ALL inside one command
            const prostavaId = TelegramUtils.isProstavaCommand(command) && TelegramUtils.getSceneState(ctx).prostavaId;
            await ctx.scene.enter(scene, { command: command, prostavaId: prostavaId });
        };
    }
    static async hideScene(ctx: UpdateContext): Promise<void> {
        const sceneState = TelegramUtils.getSceneState(ctx);
        if (sceneState.messageId) {
            await ctx.unpinChatMessage(sceneState.messageId).catch((err) => console.log(err));
            await ctx.deleteMessage(sceneState.messageId).catch((err) => console.log(err));
        }
    }

    static showActionCbMessage(action: string, value?: string) {
        return async (ctx: UpdateContext): Promise<true> =>
            await ctx.answerCbQuery(LocaleUtils.getActionReplyText(ctx.i18n, action, value));
    }
}
