import { UserStats } from "stats";
import { PROSTAVA } from "../constants";
import { UpdateContext } from "../types";
import { LocaleUtils, StatsUtils, TelegramUtils } from "../utils";
import { StatsView } from "../views";

export class StatsController {
    static async showTotalStats(ctx: UpdateContext): Promise<void> {
        const message = await ctx.reply(
            await StatsView.getStatsHtml(
                ctx.i18n,
                PROSTAVA.ACTION.STATS_RATING_TOTAL,
                StatsUtils.getUsersTotalRating(ctx.group.users, ctx.group.prostavas)
            ),
            {
                reply_markup: StatsView.getStatsKeyboard(ctx.i18n).reply_markup,
                parse_mode: "HTML"
            }
        );
        TelegramUtils.setSceneState(ctx, { messageId: message.message_id });
    }

    static async showStats(ctx: UpdateContext): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        let usersStats: UserStats[] = [];
        switch (actionData?.action) {
            case PROSTAVA.ACTION.STATS_RATING_TOTAL:
                usersStats = StatsUtils.getUsersTotalRating(ctx.group.users, ctx.group.prostavas);
                break;
            case PROSTAVA.ACTION.STATS_RATING_AVERAGE:
                usersStats = StatsUtils.getUsersAverageRating(ctx.group.users, ctx.group.prostavas);
                break;
            case PROSTAVA.ACTION.STATS_RATING_MAX:
                usersStats = StatsUtils.getUsersMaxRating(ctx.group.users, ctx.group.prostavas);
                break;
            case PROSTAVA.ACTION.STATS_RATING_MIN:
                usersStats = StatsUtils.getUsersMinRating(ctx.group.users, ctx.group.prostavas);
                break;
            case PROSTAVA.ACTION.STATS_NUMBER_APPROVED:
                usersStats = StatsUtils.getUsersApprovedProstavasNumber(ctx.group.users, ctx.group.prostavas);
                break;
            case PROSTAVA.ACTION.STATS_NUMBER_REJECTED:
                usersStats = StatsUtils.getUsersRejectedProstavasNumber(ctx.group.users, ctx.group.prostavas);
                break;
            case PROSTAVA.ACTION.STATS_NUMBER_PARTICIPATIONS:
                usersStats = StatsUtils.getUsersParticipationsNumber(ctx.group.users, ctx.group.prostavas);
                break;
            default:
                break;
        }
        await ctx.editMessageText(await StatsView.getStatsHtml(ctx.i18n, actionData?.action || "", usersStats), {
            reply_markup: StatsView.getStatsKeyboard(ctx.i18n).reply_markup,
            parse_mode: "HTML"
        });
    }

    static async switchStats(ctx: UpdateContext): Promise<void> {
        await ctx.editMessageText(LocaleUtils.getCommandText(ctx.i18n, PROSTAVA.COMMAND.STATS), {
            reply_markup: StatsView.getSwitchStatsKeyboard(ctx.i18n).reply_markup
        });
    }
}
