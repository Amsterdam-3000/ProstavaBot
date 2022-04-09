import Queue from "bull";

import { bot } from "../commons/bot";
import { PROSTAVA } from "../constants";
import { GroupUtils, TelegramUtils } from "../utils";

export class StatsProcess {
    static async showLastYearStats(job: Queue.Job): Promise<void> {
        const groups = await GroupUtils.getGroupsFromDB();
        if (!groups?.length) {
            return;
        }
        groups.forEach((group) => {
            bot.handleUpdate(
                TelegramUtils.fillCommandFakeUpdate(
                    group._id,
                    bot.botInfo?.id,
                    PROSTAVA.COMMAND.STATS_TOTAL,
                    bot.botInfo?.is_bot,
                    (new Date().getFullYear() - 1).toString()
                )
            );
        });
    }
}
