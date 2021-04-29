import { AztroModel } from "../models";
import { PROSTAVA } from "../constants";
import { Aztro, UpdateContext } from "../types";
import { LocaleUtils, ObjectUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { ProfileView } from "../views";

export class ProfileController {
    static async showProfile(ctx: UpdateContext) {
        const message = await ctx.reply(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILE, ctx.user?.personal_data?.name),
            ProfileView.getProfileKeyboard(ctx.i18n, ctx.user?.personal_data)
        );
        TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message));
    }

    static async showProfiles(ctx: UpdateContext) {
        const user = TelegramUtils.getTextMessage(ctx).text.substring(1).startsWith(PROSTAVA.COMMAND.PROFILES_ME)
            ? ctx.user
            : ProstavaUtils.findUserByEmoji(ctx.group.users, TelegramUtils.getCommandText(ctx));
        if (user) {
            let aztro: Aztro | undefined;
            if (user.personal_data.birthday) {
                aztro = await AztroModel.getTodayHoroscope(user.personal_data.birthday);
            }
            await ctx.replyWithPhoto(user.user_photo!, {
                caption: await ProfileView.getProfileHtml(ctx.i18n, user, aztro),
                parse_mode: "HTML"
            });
        } else {
            await ctx.replyWithHTML(await ProfileView.getProfilesHtml(ctx.i18n, ctx.group.users));
        }
    }
}
