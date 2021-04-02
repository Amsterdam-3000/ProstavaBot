import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Markup } from "telegraf";
import { ACTION, LOCALE_ACTION, LANGUAGE_CODE, LANGUAGE_CODE_TEXT } from "../commons/constants";
import { selectValue, stringifyActionData, unselectValue } from "../commons/utils";
import { UpdateContext } from "../types/context";
import { getBackButton, oneColumn } from "./scene";

export const getSettingsKeyboard = (ctx: UpdateContext) =>
    Markup.inlineKeyboard(
        [
            Markup.button.callback(
                ctx.i18n.t(LOCALE_ACTION.SHOW_LANGUAGES, { language: getLanguageCodeText(ctx.i18n.languageCode) }),
                ACTION.SHOW_LANGUAGES
            )
        ],
        {
            wrap: oneColumn
        }
    );

const getLanguageCodeText = (languageCode: string) => LANGUAGE_CODE_TEXT[languageCode.toUpperCase()];

export const getLanguageKeyboard = (ctx: UpdateContext) =>
    Markup.inlineKeyboard([...getLanguageCodeButtons(ctx.i18n), getBackButton(ctx)], {
        wrap: oneColumn
    });

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
