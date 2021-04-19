import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Markup } from "telegraf";
import { PROSTAVA, LOCALE, CODE } from "../constants";
import { ConstantUtils, LocaleUtils, ObjectUtils, StringUtils } from "../utils";
import { GroupSettings } from "../types";
import { CommonView } from "./common";

export class SettingsView {
    static getSettingsKeyboard(i18n: I18nContext, settings: GroupSettings) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.SETTINGS_LANGUAGE,
                        ConstantUtils.getLanguageCode(i18n.languageCode)
                    ),
                    PROSTAVA.ACTION.SETTINGS_LANGUAGE
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.SETTINGS_CURRENCY, settings.currency),
                    PROSTAVA.ACTION.SETTINGS_CURRENCY
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.SETTINGS_DAYS, settings.create_days_ago.toString()),
                    PROSTAVA.ACTION.SETTINGS_DAYS
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.SETTINGS_COUNT,
                        settings.chat_members_count.toString()
                    ),
                    PROSTAVA.ACTION.SETTINGS_COUNT
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.SETTINGS_PERCENTAGE,
                        settings.participants_min_percent.toString()
                    ),
                    PROSTAVA.ACTION.SETTINGS_PERCENTAGE
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.SETTINGS_HOURS, settings.pending_hours.toString()),
                    PROSTAVA.ACTION.SETTINGS_HOURS
                )
            ],
            {
                wrap: (btn, index, row) => row.length === 1
            }
        );
    }

    //Language
    static getLanguageKeyboard(i18n: I18nContext) {
        return Markup.inlineKeyboard([...this.getLanguageCodeButtons(i18n), CommonView.getBackButton(i18n)], {
            wrap: (btn, index, row) => row.length === 1
        });
    }
    private static getLanguageCodeButtons(i18n: I18nContext) {
        return Object.values(LOCALE.LANGUAGE).map((language) =>
            Markup.button.callback(
                StringUtils.displaySelectedValue(
                    ConstantUtils.getLanguageCode(language),
                    language === i18n.languageCode
                ),
                ObjectUtils.stringifyActionData(StringUtils.getSubAction(PROSTAVA.ACTION.SETTINGS_LANGUAGE), language)
            )
        );
    }

    //Currency
    static getCurrencyKeyboard(i18n: I18nContext, currencyNow: string) {
        return Markup.inlineKeyboard(
            [...this.getCurrencyCodeButtons(i18n, currencyNow), CommonView.getBackButton(i18n)],
            {
                wrap: (btn, index, row) => row.length === 1
            }
        );
    }
    private static getCurrencyCodeButtons(i18n: I18nContext, currencyNow: string) {
        return Object.values(CODE.CURRENCY).map((currency) =>
            Markup.button.callback(
                StringUtils.displaySelectedValue(currency, currency === currencyNow),
                ObjectUtils.stringifyActionData(StringUtils.getSubAction(PROSTAVA.ACTION.SETTINGS_CURRENCY), currency)
            )
        );
    }
}
