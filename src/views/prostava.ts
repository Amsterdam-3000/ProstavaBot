import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Markup } from "telegraf";
import { renderFile } from "ejs";
import { resolve } from "path";
import { ConstantUtils, DateUtils, LocaleUtils, ConverterUtils, ProstavaUtils, TelegramUtils } from "../utils";
import { CODE, PROSTAVA } from "../constants";
import { Group, GroupSettings, Prostava, ProstavaData, ProstavaDocument, ProstavaType, User } from "../types";
import { prostavaCalendar } from "../scenes";
import { CommonView } from "./common";

export class ProstavaView {
    static getProstavaCreateKeyboard(i18n: I18nContext, prostavaData: ProstavaData, canCreate: boolean) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_TYPE,
                        ConverterUtils.displayValue(prostavaData.type)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_TYPE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_TITLE,
                        ConverterUtils.displayValue(prostavaData.title)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_TITLE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_DATE,
                        ConverterUtils.displayValue(DateUtils.getDateString(i18n.languageCode, prostavaData.date))
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_DATE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_VENUE,
                        ProstavaUtils.getVenueDisplayString(prostavaData.venue)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_VENUE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_COST,
                        ConverterUtils.displayValue(prostavaData.cost?.string)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_COST)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_CREATE,
                        ConstantUtils.getCheckedCode(canCreate)
                    ),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_CREATE)
                ),
                CommonView.getExitButton(i18n)
            ],
            { columns: 1 }
        );
    }

    //Rating
    static getProstavaRatingKeyboard(prostava: Prostava) {
        return Markup.inlineKeyboard(this.getRatingButtons(prostava));
    }
    private static getRatingButtons(prostava: Prostava) {
        return Object.entries(CODE.RATING).map((ratingCode) =>
            Markup.button.callback(
                ratingCode[1] + ratingCode[0],
                ConverterUtils.stringifyActionData(
                    ConverterUtils.getSubAction(PROSTAVA.ACTION.PROSTAVA_RATING),
                    ratingCode[0],
                    (prostava as ProstavaDocument).id,
                    true
                )
            )
        );
    }

    //Prostava type
    static getProstavaTypeKeyboard(i18n: I18nContext, types: ProstavaType[], typeEmoji: string | undefined) {
        return Markup.inlineKeyboard(
            [
                ...this.getProstavaTypeButtons(types, typeEmoji),
                CommonView.getBackButton(i18n),
                CommonView.getExitButton(i18n)
            ],
            { columns: 1 }
        );
    }
    private static getProstavaTypeButtons(types: ProstavaType[], typeEmoji: string | undefined) {
        return types.map((type) =>
            Markup.button.callback(
                ConverterUtils.displaySelectedValue(type.string!, type.emoji === typeEmoji),
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

    static getPendingUsersHtml(i18n: I18nContext, users: Group["users"]) {
        return renderFile(resolve(__dirname, "pending.ejs"), {
            i18n: i18n,
            users: users,
            ACTION: PROSTAVA.ACTION,
            LocaleUtils: LocaleUtils
        });
    }

    //Inline Query
    static getProstavaTitle(i18n: I18nContext, prostava: Prostava) {
        return `${prostava.prostava_data.type} ${prostava.prostava_data.title} • ${LocaleUtils.getStatusText(
            i18n,
            prostava.status
        )}`;
    }
    static getProstavaDescription(i18n: I18nContext, prostava: Prostava) {
        const author = prostava.author as User;
        return (
            `${author.personal_data.emoji} ${author.personal_data.name} • ${DateUtils.getDateString(
                i18n.languageCode,
                prostava.prostava_data.date
            )}` +
            "\n" +
            `${ProstavaUtils.getParticipantsString(prostava.participants, prostava.participants_min_count)}`
        );
    }
}
