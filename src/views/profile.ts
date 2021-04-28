import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { renderFile } from "ejs";
import { resolve } from "path";
import { Markup } from "telegraf";
import { PROSTAVA, CODE } from "../constants";
import { Group, PersonalData, User } from "../types";
import { DateUtils, LocaleUtils, ObjectUtils, StringUtils } from "../utils";

export class ProfileView {
    static getProfileKeyboard(i18n: I18nContext, personalData: PersonalData) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.PROFILE_EMOJI, personalData.emoji),
                    ObjectUtils.stringifyActionData(PROSTAVA.ACTION.PROFILE_EMOJI)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROFILE_BIRTHDAY,
                        StringUtils.displayValue(
                            DateUtils.getDateString(i18n.languageCode, personalData.birthday),
                            CODE.ACTION.PROFILE_BIRTHDAY
                        )
                    ),
                    ObjectUtils.stringifyActionData(PROSTAVA.ACTION.PROFILE_BIRTHDAY)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.PROFILE_USERNAME, personalData.name),
                    ObjectUtils.stringifyActionData(PROSTAVA.ACTION.PROFILE_USERNAME)
                )
            ],
            {
                wrap: (btn, index, row) => row.length === 1
            }
        );
    }

    static getProfileHtml(i18n: I18nContext, user: User) {
        return renderFile(resolve(__dirname, "profile.ejs"), {
            i18n: i18n,
            user: user,
            ACTION: PROSTAVA.ACTION,
            CODE: CODE.ACTION,
            LocaleUtils: LocaleUtils,
            DateUtils: DateUtils
        });
    }

    //TODO move to view
    static getUsersListMD(i18n: I18nContext, users: Group["users"]) {
        const usersList =
            "\n" +
            users
                .reduce(
                    (usersLinkString, user) =>
                        usersLinkString +
                        "\n" +
                        (user as User).personal_data.emoji +
                        " " +
                        `[${(user as User).personal_data.name}]` +
                        `(${(user as User).user_link})`,
                    ""
                )
                .trim();
        return (
            `/${PROSTAVA.COMMAND.PROFILE}` +
            " " +
            LocaleUtils.getCommandPlaceholder(i18n, PROSTAVA.COMMAND.PROFILE) +
            " " +
            LocaleUtils.getCommandText(i18n, PROSTAVA.COMMAND.PROFILE_SHOW) +
            usersList
        );
    }
}
