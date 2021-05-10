import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Markup } from "telegraf";
import { renderFile } from "ejs";
import { resolve } from "path";
import { ConstantUtils, DateUtils, LocaleUtils, ConverterUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { CODE, PROSTAVA } from "../constants";
import { Group, GroupSettings, Prostava, ProstavaType, User } from "../types";
import { prostavaCalendar } from "../scenes";
import { CommonView } from "./common";

export class ProstavaView {
    static getProstavaCreateKeyboard(i18n: I18nContext, prostava: Prostava, canCreate: boolean, backButton = false) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_AUTHOR,
                        ConverterUtils.displayValue((prostava.author as User)?.user_string)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_AUTHOR),
                    !prostava.is_request
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_TYPE,
                        ConverterUtils.displayValue(prostava.prostava_data.type)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_TYPE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_TITLE,
                        ConverterUtils.displayValue(prostava.prostava_data.title)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_TITLE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_DATE,
                        ConverterUtils.displayValue(
                            DateUtils.getDateString(i18n.languageCode, prostava.prostava_data.date)
                        )
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_DATE),
                    prostava.is_request
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_VENUE,
                        ProstavaUtils.getVenueDisplayString(prostava.prostava_data.venue)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_VENUE),
                    prostava.is_request
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_COST,
                        ConverterUtils.displayValue(prostava.prostava_data.cost?.string)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_COST),
                    prostava.is_request
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_CREATE,
                        ConstantUtils.getCheckedCode(canCreate)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_CREATE)
                ),
                CommonView.getBackButton(i18n, !backButton),
                CommonView.getExitButton(i18n)
            ],
            { columns: 1 }
        );
    }
    static getProstavaKeyboard(i18n: I18nContext, prostavas: Prostava[]) {
        return Markup.inlineKeyboard([...this.getProstavaButtons(prostavas), CommonView.getExitButton(i18n)], {
            columns: 1
        });
    }
    private static getProstavaButtons(prostavas: Prostava[]) {
        return prostavas.map((prostava) =>
            Markup.button.callback(
                prostava.title!,
                ConverterUtils.stringifyActionData(
                    PROSTAVA.ACTION.PROSTAVA_PROSTAVA,
                    ProstavaUtils.getProstavaId(prostava)
                )
            )
        );
    }

    //Rating
    static getProstavaRatingKeyboard(i18n: I18nContext, prostava: Prostava) {
        return Markup.inlineKeyboard(this.getProstavaRatingButtons(i18n, prostava));
    }
    private static getProstavaRatingButtons(i18n: I18nContext, prostava: Prostava) {
        const ratingCodes = prostava.is_request ? Object.entries(CODE.POLLING) : Object.entries(CODE.RATING);
        return ratingCodes.map((ratingCode) =>
            Markup.button.callback(
                prostava.is_request ? LocaleUtils.getPollingText(i18n, ratingCode[1]) : ratingCode[1] + ratingCode[0],
                ConverterUtils.stringifyActionData(
                    ConverterUtils.getSubAction(PROSTAVA.ACTION.PROSTAVA_RATING),
                    ratingCode[0],
                    ProstavaUtils.getProstavaId(prostava),
                    true
                )
            )
        );
    }

    //Prostava type
    static getProstavaTypeKeyboard(i18n: I18nContext, types: ProstavaType[]) {
        return Markup.inlineKeyboard([...this.getProstavaTypeButtons(types), CommonView.getExitButton(i18n)], {
            columns: 1
        });
    }
    private static getProstavaTypeButtons(types: ProstavaType[]) {
        return types.map((type) =>
            Markup.button.callback(
                type.string!,
                ConverterUtils.stringifyActionData(
                    ConverterUtils.getSubAction(PROSTAVA.ACTION.PROSTAVA_TYPE),
                    type.emoji
                )
            )
        );
    }

    static getProstavaCalendarKeyboard(i18n: I18nContext, settings: GroupSettings) {
        return prostavaCalendar
            .setMinDate(DateUtils.getDateDaysAgo(settings.create_days_ago))
            .setMaxDate(new Date())
            .setWeekDayNames(DateUtils.getWeekDayNames(i18n.languageCode))
            .setMonthNames(DateUtils.getMonthNames(i18n.languageCode))
            .getCalendar(new Date());
    }

    static getProstavaHtml(i18n: I18nContext, prostava: Prostava) {
        return renderFile(resolve(__dirname, "prostava.ejs"), {
            i18n: i18n,
            prostava: prostava,
            ACTION: PROSTAVA.ACTION,
            CODE: CODE.ACTION,
            LocaleUtils: LocaleUtils,
            DateUtils: DateUtils,
            TelegramUtils: TelegramUtils,
            ProstavaUtils: ProstavaUtils
        });
    }

    static getPendingUsersHtml(i18n: I18nContext, prostava: Prostava, users: Group["users"]) {
        return renderFile(resolve(__dirname, "pending.ejs"), {
            i18n: i18n,
            prostava: prostava,
            users: users,
            ACTION: PROSTAVA.ACTION,
            LocaleUtils: LocaleUtils
        });
    }

    //Inline Query
    static getProstavaTitle(i18n: I18nContext, prostava: Prostava) {
        return `${prostava.title} • ${LocaleUtils.getStatusText(i18n, prostava.status)}`;
    }
    static getProstavaDescription(i18n: I18nContext, prostava: Prostava) {
        const author = prostava.author as User;
        return (
            `${author.user_string} • ${DateUtils.getDateString(i18n.languageCode, prostava.prostava_data.date)}` +
            "\n" +
            `${ProstavaUtils.getParticipantsString(prostava.participants, prostava.participants_min_count)}`
        );
    }
}
