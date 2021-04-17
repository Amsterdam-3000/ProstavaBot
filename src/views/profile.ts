import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Markup } from "telegraf";
import { PROSTAVA, CODE } from "../constants";
import { PersonalData } from "../types";
import { DateUtils, FunctionUtils, LocaleUtils, ObjectUtils, StringUtils } from "../utils";

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
                wrap: FunctionUtils.oneColumn
            }
        );
    }
}
