import { PROSTAVA } from "../constants";
import { UpdateContext, UserStats } from "../types";
import { StatsUtils, TelegramUtils } from "../utils";
import { StatsView } from "../views";

export class StatsController {
    static async showTotalStats(ctx: UpdateContext): Promise<void> {
        const isStatsAll = TelegramUtils.getMessageCommand(ctx) === PROSTAVA.COMMAND.STATS;
        const year = StatsUtils.getCommandYear(ctx);
        const message = await ctx.reply(
            await StatsView.getStatsHtml(
                ctx.i18n,
                PROSTAVA.ACTION.STATS_RATING_TOTAL,
                StatsUtils.sortAndPadUsersStatsByRating(
                    StatsUtils.getUsersTotalRating(ctx.group.users, ctx.group.prostavas, year)
                ),
                year
            ),
            {
                reply_markup: isStatsAll ? StatsView.getStatsKeyboard(ctx.i18n).reply_markup : undefined,
                parse_mode: "HTML"
            }
        );
        if (isStatsAll) {
            TelegramUtils.setSceneState(ctx, {
                messageId: message.message_id,
                command: year?.toString()
            });
        }
    }

    static async showStats(ctx: UpdateContext): Promise<void> {
        const actionData = TelegramUtils.getActionDataFromCbQuery(ctx);
        let usersStats: UserStats[] = [];
        const year = Number(TelegramUtils.getSceneCommand(ctx)) || undefined;
        switch (actionData?.action) {
            case PROSTAVA.ACTION.STATS_RATING_TOTAL:
                usersStats = StatsUtils.getUsersTotalRating(ctx.group.users, ctx.group.prostavas, year);
                break;
            case PROSTAVA.ACTION.STATS_RATING_AVERAGE:
                usersStats = StatsUtils.getUsersAverageRating(ctx.group.users, ctx.group.prostavas, year);
                break;
            case PROSTAVA.ACTION.STATS_RATING_MAX:
                usersStats = StatsUtils.getUsersMaxRating(ctx.group.users, ctx.group.prostavas, year);
                break;
            case PROSTAVA.ACTION.STATS_RATING_MIN:
                usersStats = StatsUtils.getUsersMinRating(ctx.group.users, ctx.group.prostavas, year);
                break;
            case PROSTAVA.ACTION.STATS_NUMBER_APPROVED:
                usersStats = StatsUtils.getUsersApprovedProstavasNumber(ctx.group.users, ctx.group.prostavas, year);
                break;
            case PROSTAVA.ACTION.STATS_NUMBER_REJECTED:
                usersStats = StatsUtils.getUsersRejectedProstavasNumber(ctx.group.users, ctx.group.prostavas, year);
                break;
            case PROSTAVA.ACTION.STATS_NUMBER_PARTICIPATIONS:
                usersStats = StatsUtils.getUsersParticipationsNumber(ctx.group.users, ctx.group.prostavas, year);
                break;
            default:
                break;
        }
        try {
            await ctx.editMessageText(
                await StatsView.getStatsHtml(
                    ctx.i18n,
                    actionData?.action || "",
                    StatsUtils.sortAndPadUsersStatsByRating(usersStats),
                    year
                ),
                {
                    reply_markup: StatsView.getStatsKeyboard(ctx.i18n).reply_markup,
                    parse_mode: "HTML"
                }
            );
        } catch {
            ctx.answerCbQuery();
        }
    }
}
