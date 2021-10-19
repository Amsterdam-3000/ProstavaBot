import { Telegraf } from "telegraf";
import { cache } from "../commons/cache";
import { i18n } from "../commons/locale";
import { CODE } from "../constants";
import { UpdateContext } from "../types";
import { mainStage } from "../scenes";
import { LocaleUtils, ConverterUtils, TelegramUtils } from "../utils";

export class GlobalMiddleware {
    static addSessionToContext = cache.middleware();
    static addI18nToContext = i18n.middleware();
    static addLoggingContext = Telegraf.log();
    static addStageToContext = mainStage.middleware();

    static async isGroupChat(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
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

    static async isUserRealOrProstavaBot(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const user = TelegramUtils.getUserFromContext(ctx);
        if (!TelegramUtils.isUserReal(user) && !TelegramUtils.isUserProstavaBot(ctx.botInfo, user)) {
            return;
        }
        await next();
    }
    static async isUserAdmin(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const user = TelegramUtils.getUserFromContext(ctx);
        if (!user) {
            return;
        }
        const chatMember = await ctx.getChatMember(user.id);
        if (!TelegramUtils.isMemberAdmin(chatMember)) {
            ctx.reply(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_ADMIN));
            return;
        }
        await next();
    }
    static async addChatToUserSession(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        await next();
        if (!ctx.chat) {
            return;
        }
        const user = TelegramUtils.getUserFromContext(ctx);
        //Save chat id for future inline queries
        cache.saveSession(ConverterUtils.concatSessionKey(user?.id)!, { chat: ctx.chat });
    }
}
