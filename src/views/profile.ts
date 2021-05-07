import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { renderFile } from "ejs";
import { resolve } from "path";
import { Markup } from "telegraf";
import { PROSTAVA, CODE } from "../constants";
import { Aztro, Group, PersonalData, User } from "../types";
import { DateUtils, LocaleUtils, ConverterUtils } from "../utils";
import { CommonView } from "./common";

export class ProfileView {
    static getProfileKeyboard(i18n: I18nContext, personalData: PersonalData) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.PROFILE_EMOJI, personalData.emoji),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROFILE_EMOJI)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROFILE_BIRTHDAY,
                        ConverterUtils.displayValue(
                            DateUtils.getDateString(i18n.languageCode, personalData.birthday),
                            CODE.ACTION.PROFILE_BIRTHDAY
                        )
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROFILE_BIRTHDAY)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.PROFILE_USERNAME, personalData.name),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROFILE_USERNAME)
                ),
                CommonView.getExitButton(i18n)
            ],
            { columns: 1 }
        );
    }

    static getProfileHtml(i18n: I18nContext, user: User, aztro: Aztro | undefined) {
        return renderFile(resolve(__dirname, "profile.ejs"), {
            i18n: i18n,
            user: user,
            aztro: aztro,
            CODE: CODE.ACTION,
            LocaleUtils: LocaleUtils,
            DateUtils: DateUtils
        });
    }

    static getProfilesHtml(i18n: I18nContext, users: Group["users"]) {
        return renderFile(resolve(__dirname, "profiles.ejs"), {
            i18n: i18n,
            users: users,
            COMMAND: PROSTAVA.COMMAND,
            LocaleUtils: LocaleUtils
        });
    }
}
