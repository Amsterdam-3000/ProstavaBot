import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { I18nContext } from "@grammyjs/i18n";
import { renderFile } from "ejs";
import { resolve } from "path";
import { Markup } from "telegraf";

import { UserStats } from "../types";
import { PROSTAVA, CODE } from "../constants";
import { LocaleUtils } from "../utils";
import { CommonView } from "./common";

export class StatsView {
    static getStatsKeyboard(i18n: I18nContext): Markup.Markup<InlineKeyboardMarkup> {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_RATING_TOTAL),
                    PROSTAVA.ACTION.STATS_RATING_TOTAL
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_RATING_AVERAGE),
                    PROSTAVA.ACTION.STATS_RATING_AVERAGE
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_RATING_MAX),
                    PROSTAVA.ACTION.STATS_RATING_MAX
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_RATING_MIN),
                    PROSTAVA.ACTION.STATS_RATING_MIN
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_NUMBER_APPROVED),
                    PROSTAVA.ACTION.STATS_NUMBER_APPROVED
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_NUMBER_REJECTED),
                    PROSTAVA.ACTION.STATS_NUMBER_REJECTED
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_NUMBER_PARTICIPATIONS),
                    PROSTAVA.ACTION.STATS_NUMBER_PARTICIPATIONS
                ),
                CommonView.getExitButton(i18n)
            ],
            { columns: 1 }
        );
    }

    static getStatsHtml(i18n: I18nContext, action: string, stats: UserStats[], year?: number): Promise<string> {
        return renderFile(resolve(__dirname, "stats.ejs"), {
            i18n: i18n,
            CODE: CODE,
            LocaleUtils: LocaleUtils,
            action: action,
            usersStats: stats,
            year: year
        });
    }
}
