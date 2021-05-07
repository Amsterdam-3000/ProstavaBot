import { CODE } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, ConverterUtils, RegexUtils, TelegramUtils } from "../utils";

export class CommonMiddleware {
    static async saveActionDataToState(ctx: UpdateContext, next: () => Promise<void>) {
        TelegramUtils.setSceneStateToContext(
            ctx,
            ConverterUtils.addActionToState(TelegramUtils.getSceneState(ctx), TelegramUtils.getCbQueryData(ctx))
        );
        await next();
    }
    static checkStateAction = (actions: Array<string>) => async (ctx: UpdateContext, next: () => Promise<void>) => {
        const sceneState = TelegramUtils.getSceneState(ctx);
        const action = ConverterUtils.parseActionData(sceneState?.actionData)?.action;
        if (!action || !RegexUtils.matchAction(action).test(actions.join("|"))) {
            return;
        }
        await next();
    };

    static async leaveSceneAfter(ctx: UpdateContext, next: () => Promise<void>) {
        await next();
        await ctx.scene.leave();
    }

    static async isCbMessageOrigin(ctx: UpdateContext, next: () => Promise<void>) {
        const actionData = ConverterUtils.parseActionData(TelegramUtils.getCbQueryData(ctx));
        const sceneState = TelegramUtils.getSceneState(ctx);
        if (
            !actionData?.isPublic &&
            ctx.callbackQuery &&
            ctx.callbackQuery.message?.message_id !== sceneState.message?.message_id
        ) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.ARE_GOING));
            return;
        }
        await next();
    }
}
