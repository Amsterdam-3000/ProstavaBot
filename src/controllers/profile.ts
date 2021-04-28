import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, ObjectUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { ProfileView } from "../views";

export class ProfileController {
    static async showProfile(ctx: UpdateContext) {
        const user = ProstavaUtils.findUserByEmoji(ctx.group.users, TelegramUtils.getCommandText(ctx));
        if (user) {
            await ctx.replyWithPhoto(user.user_photo!, {
                caption: await ProfileView.getProfileHtml(ctx.i18n, user),
                parse_mode: "HTML"
            });
        } else {
            const message = await ctx.reply(
                LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILE, ctx.user?.personal_data?.name),
                ProfileView.getProfileKeyboard(ctx.i18n, ctx.user?.personal_data)
            );
            TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message));
        }
    }

    static async showProfiles(ctx: UpdateContext) {
        await ctx.replyWithMarkdownV2(ProfileView.getUsersListMD(ctx.i18n, ctx.group.users));
    }
}
