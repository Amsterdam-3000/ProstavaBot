import { AztroModel } from "../models";
import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, TelegramUtils, UserUtils } from "../utils";
import { ProfileView } from "../views";

export class ProfileController {
    static async completeProfile(ctx: UpdateContext): Promise<void> {
        const message = await ctx.reply(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILE, ctx.user?.personal_data?.name),
            ProfileView.getProfileKeyboard(ctx.i18n, ctx.user?.personal_data)
        );
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }

    static async showMyProfile(ctx: UpdateContext): Promise<void> {
        const aztro = await AztroModel.getTodayHoroscope(ctx.user.personal_data.birthday);
        const message = await ctx.replyWithPhoto(ctx.user.user_photo || "", {
            caption: await ProfileView.getProfileHtml(ctx.i18n, ctx.user, aztro),
            reply_markup: ProfileView.getUserKeyboard(ctx.i18n).reply_markup,
            parse_mode: "HTML"
        });
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }
    static async showUserProfile(ctx: UpdateContext): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        const user = UserUtils.findUserByUserId(ctx.group.users, Number(actionData?.value));
        if (!user) {
            return;
        }
        const aztro = await AztroModel.getTodayHoroscope(user.personal_data.birthday);
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: user.user_photo || "",
                caption: await ProfileView.getProfileHtml(ctx.i18n, user, aztro),
                parse_mode: "HTML"
            },
            {
                reply_markup: ProfileView.getUserKeyboard(ctx.i18n).reply_markup
            }
        );
    }
    static async showProfiles(ctx: UpdateContext): Promise<void> {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: ctx.group.group_photo || "",
                caption: LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILES)
            },
            {
                reply_markup: ProfileView.getUsersKeyboard(ctx.i18n, UserUtils.filterRealUsers(ctx.group.users))
                    .reply_markup
            }
        );
    }
}
