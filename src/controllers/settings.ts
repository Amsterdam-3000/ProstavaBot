import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { SettingsView } from "../views";
import { LocaleUtils, ObjectUtils, TelegramUtils } from "../utils";

export class SettingsController {
    static async showSettings(ctx: UpdateContext) {
        ctx.reply(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.SETTINGS),
            SettingsView.getSettingsKeyboard(ctx.i18n, ctx.group?.settings)
        ).then((message) => TelegramUtils.setSceneStateToContext(ctx, ObjectUtils.initializeState(message)));
    }

    static async showLanguages(ctx: UpdateContext) {
        ctx.editMessageText(
            LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.SETTINGS_LANGUAGE),
            SettingsView.getLanguageKeyboard(ctx.i18n)
        );
    }
    static async showCurrencies(ctx: UpdateContext) {
        ctx.editMessageText(
            LocaleUtils.getActionReplyText(ctx.i18n, PROSTAVA.ACTION.SETTINGS_CURRENCY),
            SettingsView.getCurrencyKeyboard(ctx.i18n, ctx.group?.settings?.currency)
        );
    }

    static async backToSettings(ctx: UpdateContext) {
        ctx.editMessageText(
            LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.SETTINGS),
            SettingsView.getSettingsKeyboard(ctx.i18n, ctx.group?.settings)
        );
    }
}
