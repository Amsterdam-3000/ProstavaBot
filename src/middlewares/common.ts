import { CODE } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, ObjectUtils, TelegramUtils } from "../utils";

export class CommonMiddleware {
    static async saveActionDataToState(ctx: UpdateContext, next: Function) {
        TelegramUtils.setSceneStateToContext(
            ctx,
            ObjectUtils.addActionToState(TelegramUtils.getSceneState(ctx), TelegramUtils.getCbQueryData(ctx))
        );
        await next();
    }
    static checkStateAction = (actions: Array<string>) => async (ctx: UpdateContext, next: Function) => {
        const sceneState = TelegramUtils.getSceneState(ctx);
        if (!actions.join("").includes(ObjectUtils.parseActionData(sceneState?.actionData)?.action!)) {
            return;
        }
        await next();
    };

    static async isCbMessageOrigin(ctx: UpdateContext, next: Function) {
        const sceneState = TelegramUtils.getSceneState(ctx);
        if (ctx.callbackQuery && ctx.callbackQuery?.message?.message_id !== sceneState.message?.message_id) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.ARE_GOING));
            return;
        }
        await next();
    }
}
