import { CODE } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, RegexUtils, TelegramUtils } from "../utils";

export class CommonMiddleware {
    static async saveActionDataToState(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        TelegramUtils.setSceneState(ctx, { actionData: TelegramUtils.getCbQueryData(ctx) });
        await next();
    }
    static checkStateAction =
        (actions: Array<string>) =>
        async (ctx: UpdateContext, next: () => Promise<void>): Promise<void> => {
            const action = TelegramUtils.getActionDataFromSceneState(ctx)?.action;
            if (!action || !RegexUtils.matchAction(action).test(actions.join("|"))) {
                return;
            }
            await next();
        };

    static async isCbMessageOrigin(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        const sceneState = TelegramUtils.getSceneState(ctx);
        if (
            !actionData?.isPublic &&
            ctx.callbackQuery &&
            ctx.callbackQuery.message?.message_id !== sceneState.messageId
        ) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.ARE_GOING));
            return;
        }
        await next();
    }
}
