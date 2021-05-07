import { UpdateContext, UserDocument } from "../types";
import { UserCollection } from "../models";
import { ProstavaUtils, TelegramUtils } from "../utils";

export class UserMiddleware {
    static async addUserToContext(ctx: UpdateContext, next: () => Promise<void>) {
        const user = TelegramUtils.getUserFromContext(ctx);
        ctx.user = ProstavaUtils.findUserByUserId(ctx.group.users, user?.id)!;
        if (!ctx.user) {
            ctx.user = new UserCollection(ProstavaUtils.fillNewUser(ctx));
            ctx.group.users.push(ctx.user);
        }
        await next();
    }

    static async changeUserEmoji(ctx: UpdateContext, next: () => Promise<void>) {
        ctx.user.personal_data.emoji = TelegramUtils.getTextMessage(ctx).text;
        await next();
    }
    static async changeUserBirthday(ctx: UpdateContext, next: () => Promise<void>) {
        ctx.user.personal_data.birthday = new Date(TelegramUtils.getTextMessage(ctx).text);
        await next();
    }
    static async changeUserName(ctx: UpdateContext, next: () => Promise<void>) {
        ctx.user.personal_data.name = TelegramUtils.getTextMessage(ctx).text;
        await next();
    }

    static async saveUser(ctx: UpdateContext, next: () => Promise<void>) {
        await next();
        if ((ctx.user as UserDocument).isModified()) {
            try {
                await (ctx.user as UserDocument).save();
            } catch (err) {
                console.log(err);
            }
        }
    }
}
