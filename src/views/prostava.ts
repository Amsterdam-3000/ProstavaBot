import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { Markup } from "telegraf";
import { renderFile } from "ejs";
import { resolve } from "path";
import {
    ConstantUtils,
    DateUtils,
    LocaleUtils,
    ObjectUtils,
    ProstavaUtils,
    StringUtils,
    TelegramUtils
} from "../utils";
import { CODE, PROSTAVA } from "../constants";
import { Group, GroupSettings, Prostava, ProstavaData, ProstavaDocument, User } from "../types";
import { prostavaCalendar } from "../scenes";

export class ProstavaView {
    static getProstavaCreateKeyboard(i18n: I18nContext, prostavaData: ProstavaData, canCreate: boolean) {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_TITLE,
                        StringUtils.displayValue(prostavaData.title)
                    ),
                    ObjectUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_TITLE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_DATE,
                        StringUtils.displayValue(DateUtils.getDateString(i18n.languageCode, prostavaData.date))
                    ),
                    ObjectUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_DATE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_VENUE,
                        ProstavaUtils.getVenueDisplayString(prostavaData.venue)
                    ),
                    ObjectUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_VENUE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_COST,
                        StringUtils.displayValue(prostavaData.cost?.string)
                    ),
                    ObjectUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_COST)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(
                        i18n,
                        PROSTAVA.ACTION.PROSTAVA_CREATE,
                        ConstantUtils.getCheckedCode(canCreate)
                    ),
                    ObjectUtils.stringifyActionData(PROSTAVA.ACTION.PROSTAVA_CREATE)
                )
            ],
            {
                wrap: (btn, index, row) => row.length === 1
            }
        );
    }

    static getProstavaRatingKeyboard(prostava: Prostava) {
        return Markup.inlineKeyboard(this.getRatingButtons(prostava));
    }
    private static getRatingButtons(prostava: Prostava) {
        return Object.entries(CODE.RATING).map((ratingCode) =>
            Markup.button.callback(
                ratingCode[1] + ratingCode[0],
                ObjectUtils.stringifyActionData(
                    StringUtils.getSubAction(PROSTAVA.ACTION.PROSTAVA_RATING),
                    ratingCode[0],
                    (prostava as ProstavaDocument).id
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

    static getProstavaTitle(i18n: I18nContext, prostava: Prostava) {
        return `${LocaleUtils.getStatusText(i18n, prostava.status)} ${prostava.prostava_data.title}`;
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
