import { I18nContext } from "@edjopato/telegraf-i18n/dist/source";
import { renderFile } from "ejs";
import { resolve } from "path";
import { UserStats } from "stats";
import { Markup } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

import { PROSTAVA, CODE } from "../constants";
import { LocaleUtils, ConverterUtils } from "../utils";
import { CommonView } from "./common";

export class StatsView {
    static getSwitchStatsKeyboard(i18n: I18nContext): Markup.Markup<InlineKeyboardMarkup> {
        return Markup.inlineKeyboard(
            [
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_RATING_TOTAL),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.STATS_RATING_TOTAL)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_RATING_AVERAGE),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.STATS_RATING_AVERAGE)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_RATING_MAX),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.STATS_RATING_MAX)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_RATING_MIN),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.STATS_RATING_MIN)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_NUMBER_APPROVED),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.STATS_NUMBER_APPROVED)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_NUMBER_REJECTED),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.STATS_NUMBER_REJECTED)
                ),
                Markup.button.callback(
                    LocaleUtils.getActionText(i18n, PROSTAVA.ACTION.STATS_NUMBER_PARTICIPATIONS),
                    ConverterUtils.stringifyActionData(PROSTAVA.ACTION.STATS_NUMBER_PARTICIPATIONS)
                ),
                CommonView.getExitButton(i18n)
            ],
            { columns: 1 }
        );
    }

    static getStatsKeyboard(i18n: I18nContext): Markup.Markup<InlineKeyboardMarkup> {
        return Markup.inlineKeyboard(
            [
                CommonView.getBackButton(i18n, false, i18n.t("reply.stats.all_stats", { code: CODE.ACTION.BACK })),
                CommonView.getExitButton(i18n)
            ],
            { columns: 1 }
        );
    }
    static getStatsHtml(i18n: I18nContext, action: string, stats: UserStats[]): Promise<string> {
        return renderFile(resolve(__dirname, "stats.ejs"), {
            i18n: i18n,
            CODE: CODE,
            LocaleUtils: LocaleUtils,
            action: action,
            usersStats: stats
        });
    }
}
