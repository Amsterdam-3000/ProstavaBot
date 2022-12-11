import { Telegraf } from "telegraf";
import { session } from "telegraf-session-mongodb";
import { i18n } from "../commons/locale";
import { CODE } from "../constants";
import { UpdateContext } from "../types";
import { mainStage } from "../scenes";
import { LocaleUtils, TelegramUtils } from "../utils";
import { SessionUtils } from "../utils";

export class GlobalMiddleware {
    static addI18nToContext = i18n.middleware();
    static addLoggingContext = Telegraf.log();
    static addStageToContext = mainStage.middleware();
    static addSessionToContext = (db) => session(db, { sessionKeyFn: SessionUtils.getSessionKey });

    static async isProstavaBotAndGroupChat(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const user = TelegramUtils.getUserFromContext(ctx);
        if (!user) {
            return;
        }
        const chat = TelegramUtils.getChatFromContext(ctx);
        if (TelegramUtils.isUserProstavaBot(ctx.botInfo, user) && chat && !TelegramUtils.isChatGroup(chat)) {
            ctx.reply(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_GROUP));
            return;
        }
        await next();
    }

    static async isPrivateChat(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const chat = TelegramUtils.getChatFromContext(ctx);
        if (!chat) {
            return;
        }
        if (!TelegramUtils.isChatPrivate(chat)) {
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
}
