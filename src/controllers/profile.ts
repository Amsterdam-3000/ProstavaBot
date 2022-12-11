import { AztroModel } from "../models";
import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, TelegramUtils, UserUtils } from "../utils";
import { ProfileView } from "../views";

export class ProfileController {
    static async completeProfile(ctx: UpdateContext): Promise<void> {
        const message = TelegramUtils.isChatPrivate(ctx.chat)
            ? await ctx.replyWithPhoto(ctx.user.user_photo || "", {
                  caption: await ProfileView.getProfileHtml(ctx.i18n, ctx.user),
                  parse_mode: "HTML",
                  reply_markup: ProfileView.getProfileKeyboardWebApp(ctx.i18n, ctx.user).reply_markup
              })
            : await ctx.reply(
                  LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILE, ctx.user?.personal_data?.name),
                  ProfileView.getProfileKeyboard(ctx.i18n, ctx.user?.personal_data)
              );
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }

    static async showMyProfile(ctx: UpdateContext): Promise<void> {
        const isProfilesAll = TelegramUtils.getMessageCommand(ctx) === PROSTAVA.COMMAND.PROFILES;
        const message = TelegramUtils.isChatPrivate(ctx.chat)
            ? await ctx.reply(LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.PROFILES), {
                  reply_markup: ProfileView.getUsersKeyboardWebApp(
                      ctx.i18n,
                      UserUtils.filterRealUsersExceptUserId(ctx.group.users, ctx.user.user_id)
                  ).reply_markup,
                  parse_mode: "HTML"
              })
            : await ctx.replyWithPhoto(ctx.user.user_photo || "", {
                  caption: await ProfileView.getProfileHtml(
                      ctx.i18n,
                      ctx.user,
                      await AztroModel.getTodayHoroscope(ctx.user.personal_data.birthday)
                  ),
                  reply_markup: isProfilesAll
                      ? ProfileView.getUsersKeyboard(ctx.i18n, UserUtils.filterRealUsers(ctx.group.users)).reply_markup
                      : undefined,
                  parse_mode: "HTML"
              });
        if (isProfilesAll) {
            TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
        }
    }
    static async showUserProfile(ctx: UpdateContext): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        const user = UserUtils.findUserByUserId(ctx.group.users, Number(actionData?.value));
        if (!user) {
            return;
        }
        const aztro = await AztroModel.getTodayHoroscope(user.personal_data.birthday);
        try {
            await ctx.editMessageMedia(
                {
                    type: "photo",
                    media: user.user_photo || "",
                    caption: await ProfileView.getProfileHtml(ctx.i18n, user, aztro),
                    parse_mode: "HTML"
                },
                {
                    reply_markup: ProfileView.getUsersKeyboard(ctx.i18n, UserUtils.filterRealUsers(ctx.group.users))
                        .reply_markup
                }
            );
        } catch {
            ctx.answerCbQuery();
        }
    }
}
