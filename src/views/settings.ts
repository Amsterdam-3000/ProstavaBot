import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Markup } from "telegraf";
import { ACTION, LOCALE_ACTION, LANGUAGE_CODE, LANGUAGE_CODE_TEXT } from "../commons/constants";
import { selectValue, stringifyActionData, unselectValue } from "../commons/utils";
import { UpdateContext } from "../types/telegraf";

export const getSettingsKeyboard = (ctx: UpdateContext) =>
    Markup.inlineKeyboard([Markup.button.callback(getLanguageActionText(ctx.i18n), ACTION.SHOW_LANGUAGES)]);

const getLanguageActionText = (i18n: I18nContext) =>
    i18n.t(LOCALE_ACTION.SHOW_LANGUAGES, { language: getLanguageCodeText(i18n.languageCode) });
const getLanguageCodeText = (languageCode: string) => LANGUAGE_CODE_TEXT[languageCode.toUpperCase()];

export const getLanguageKeyboard = (ctx: UpdateContext) => Markup.inlineKeyboard(getLanguageCodeButtons(ctx.i18n));

const getLanguageCodeButtons = (i18n: I18nContext) =>
    Object.values(LANGUAGE_CODE).map((languageCode) =>
        Markup.button.callback(
            getLanguageCodeActionText(languageCode, i18n),
            stringifyActionData(ACTION.CHANGE_LANGUAGE, languageCode)
        )
    );
const getLanguageCodeActionText = (languageCode: string, i18n: I18nContext) =>
    languageCode === i18n.languageCode
        ? selectValue(getLanguageCodeText(languageCode))
        : unselectValue(getLanguageCodeText(languageCode));
