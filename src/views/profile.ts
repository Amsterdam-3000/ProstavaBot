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

    static getUsersKeyboard(i18n: I18nContext, users: Group["users"]) {
        return Markup.inlineKeyboard([...this.getUserButtons(users), CommonView.getExitButton(i18n)], {
            columns: users.length > 10 ? 7 : 1
        });
    }
    private static getUserButtons(users: Group["users"]) {
        return (users as User[]).map((user) =>
            Markup.button.callback(
                user.user_string!,
                ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROFILES_USER, user.user_id.toString())
            )
        );
    }

    static getUserKeyboard(i18n: I18nContext) {
        return Markup.inlineKeyboard([CommonView.getBackButton(i18n), CommonView.getExitButton(i18n)], { columns: 1 });
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
}
