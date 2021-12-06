import { AztroModel } from "../models";
import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, TelegramUtils, UserUtils } from "../utils";
import { ProfileView } from "../views";
import { Message } from "telegraf/typings/core/types/typegram";

export class ProfileController {
    static async completeProfile(ctx: UpdateContext): Promise<void> {
        const message = await ctx.reply(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILE, ctx.user?.personal_data?.name),
            ProfileView.getProfileKeyboard(ctx.i18n, ctx.user?.personal_data)
        );
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }

    static async showProfiles(ctx: UpdateContext): Promise<void> {
        let message: Message.PhotoMessage;
        if (TelegramUtils.includesCommand(ctx, PROSTAVA.COMMAND.PROFILES_ME)) {
            const aztro = await AztroModel.getTodayHoroscope(ctx.user.personal_data.birthday);
            message = await ctx.replyWithPhoto(ctx.user.user_photo!, {
                caption: await ProfileView.getProfileHtml(ctx.i18n, ctx.user, aztro),
                reply_markup: ProfileView.getUserKeyboard(ctx.i18n).reply_markup,
                parse_mode: "HTML"
            });
        } else {
            message = await ctx.replyWithPhoto(ctx.group.group_photo!, {
                caption: LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILES),
                reply_markup: ProfileView.getUsersKeyboard(ctx.i18n, UserUtils.filterRealUsers(ctx.group.users))
                    .reply_markup
            });
        }
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }
    static async showProfile(ctx: UpdateContext): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        const user = UserUtils.findUserByUserId(ctx.group.users, Number(actionData?.value));
        if (!user) {
            return;
        }
        const aztro = await AztroModel.getTodayHoroscope(user.personal_data.birthday);
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: user.user_photo!,
                caption: await ProfileView.getProfileHtml(ctx.i18n, user, aztro),
                parse_mode: "HTML"
            },
            {
                reply_markup: ProfileView.getUserKeyboard(ctx.i18n).reply_markup
            }
        );
    }
    static async backToProfiles(ctx: UpdateContext): Promise<void> {
        await ctx.editMessageMedia(
            {
                type: "photo",
                media: ctx.group.group_photo!,
                caption: LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILES)
            },
            {
                reply_markup: ProfileView.getUsersKeyboard(ctx.i18n, UserUtils.filterRealUsers(ctx.group.users))
                    .reply_markup
            }
        );
    }
}
