import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { SettingsView } from "../views";
import { LocaleUtils, TelegramUtils } from "../utils";

export class SettingsController {
    static async showSettings(ctx: UpdateContext): Promise<void> {
        const message = TelegramUtils.isChatPrivate(ctx.chat)
            ? await ctx.replyWithPhoto(ctx.group.group_photo || "", {
                  reply_markup: SettingsView.getSettingsKeyboardWebApp(ctx.i18n, ctx.group).reply_markup,
                  caption: ctx.group.settings.name,
                  parse_mode: "HTML"
              })
            : await ctx.reply(
                  LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.SETTINGS),
                  SettingsView.getSettingsKeyboard(ctx.i18n, ctx.group)
              );
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }

    static async showLanguages(ctx: UpdateContext): Promise<void> {
        await ctx
            .editMessageText(
                LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.SETTINGS_LANGUAGE),
                SettingsView.getLanguageKeyboard(ctx.i18n)
            )
            .catch((err) => console.log(err));
    }
    static async showCurrencies(ctx: UpdateContext): Promise<void> {
        await ctx
            .editMessageText(
                LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.SETTINGS_CURRENCY),
                SettingsView.getCurrencyKeyboard(ctx.i18n, ctx.group?.settings?.currency)
            )
            .catch((err) => console.log(err));
    }
    static async showProstavaTypes(ctx: UpdateContext): Promise<void> {
        const sceneState = TelegramUtils.getSceneState(ctx);
        await ctx.telegram
            .editMessageText(
                ctx.chat?.id,
                sceneState.messageId,
                undefined,
                LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.SETTINGS_TYPE),
                SettingsView.getProstavaTypesKeyboard(ctx.i18n, ctx.group?.settings?.prostava_types)
            )
            .catch((err) => console.log(err));
    }

    static async backToSettings(ctx: UpdateContext): Promise<void> {
        await ctx
            .editMessageText(
                LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.SETTINGS),
                SettingsView.getSettingsKeyboard(ctx.i18n, ctx.group)
            )
            .catch((err) => console.log(err));
    }
}
