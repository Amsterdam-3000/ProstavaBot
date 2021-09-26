import { UpdateContext } from "../types";
import { TelegramUtils, UserUtils } from "../utils";

export class UserMiddleware {
    static async addUserToContext(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        const user = TelegramUtils.getUserFromContext(ctx);
        if (!user || !ctx.group) {
            return;
        }
        ctx.user = UserUtils.findUserByUserId(ctx.group.users, user.id)!;
        if (!ctx.user) {
            ctx.user = UserUtils.createUserForGroup(ctx.group, user);
            ctx.group.users.push(ctx.user);
        }
        await next();
    }

    static async changeUserEmoji(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        ctx.user.personal_data.emoji = TelegramUtils.getTextMessage(ctx).text;
        await next();
    }
    static async changeUserBirthday(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        ctx.user.personal_data.birthday = new Date(TelegramUtils.getTextMessage(ctx).text);
        await next();
    }
    static async changeUserName(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        ctx.user.personal_data.name = TelegramUtils.getTextMessage(ctx).text;
        await next();
    }

    static async saveUser(ctx: UpdateContext, next: () => Promise<void>): Promise<void> {
        await next();
        if (!ctx.user || !UserUtils.isUserModified(ctx.user)) {
            return;
        }
        await UserUtils.saveUser(ctx.user).catch((err) => console.log(err));
    }
}
