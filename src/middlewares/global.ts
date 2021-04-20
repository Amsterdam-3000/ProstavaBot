import { Telegraf } from "telegraf";
import { cache } from "../commons/cache";
import { i18n } from "../commons/locale";
import { CODE } from "../constants";
import { UpdateContext } from "../types";
import { mainStage } from "../scenes";
import { LocaleUtils, StringUtils, TelegramUtils } from "../utils";

export class GlobalMiddleware {

    static addSessionToContext = cache.middleware();
    static addI18nToContext = i18n.middleware();
    static addLoggingContext = Telegraf.log();
    static addStageToContext = mainStage.middleware();

    static async isGroupChat(ctx: UpdateContext, next: Function) {
        const chat = TelegramUtils.getChatFromContext(ctx);
        if (!chat) {
            return;
        }
        if (!TelegramUtils.isChatGroup(chat)) {
            ctx.reply(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_GROUP));
            return;
        }
        await next();
    }
    static async addChatToUserSession(ctx: UpdateContext, next: Function) {
        if (ctx.chat) {
            ctx.session.chat = ctx.chat;
        }
        await next();
        const user = TelegramUtils.getUserFromContext(ctx);        
        //Save chat id for future inline queries
        cache.saveSession(StringUtils.concatSessionKey(user?.id)!, ctx.session);
    }
}
