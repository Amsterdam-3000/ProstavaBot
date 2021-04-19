import { CODE } from "../constants";
import { UpdateContext, UserDocument } from "../types";
import { UserCollection } from "../models";
import { LocaleUtils, ProstavaUtils, TelegramUtils } from "../utils";

export class UserMiddleware {
    static async addUserToContext(ctx: UpdateContext, next: Function) {
        const user = TelegramUtils.getUserFromContext(ctx);
        ctx.user = ProstavaUtils.findUserByUserId(ctx.group.users, user?.id)!;
        if (!ctx.user) {
            ctx.user = new UserCollection(ProstavaUtils.fillNewUser(ctx));
            ctx.group.users.push(ctx.user);
        }
        await next();
    }

    static async isUserAdmin(ctx: UpdateContext, next: Function) {
        const user = TelegramUtils.getUserFromContext(ctx);
        const chatMember = await ctx.getChatMember(user?.id!);
        if (!TelegramUtils.isMemberAdmin(chatMember)) {
            ctx.answerCbQuery(LocaleUtils.getErrorText(ctx.i18n, CODE.ERROR.NOT_ADMIN));
            return;
        }
        await next();
    }

    static async saveUser(ctx: UpdateContext, next: Function) {
        if ((ctx.user as UserDocument).isModified()) {
            try {
                await (ctx.user as UserDocument).save();
            } catch (err) {
                console.log(err);
                return;
            }
        }
        await next();
    }

    static async changeUserEmoji(ctx: UpdateContext, next: Function) {
        ctx.user.personal_data.emoji = TelegramUtils.getTextMessage(ctx).text;
        await next();
    }
    static async changeUserBirthday(ctx: UpdateContext, next: Function) {
        ctx.user.personal_data.birthday = new Date(TelegramUtils.getTextMessage(ctx).text);
        await next();
    }
    static async changeUserName(ctx: UpdateContext, next: Function) {
        ctx.user.personal_data.name = TelegramUtils.getTextMessage(ctx).text;
        await next();
    }
}
