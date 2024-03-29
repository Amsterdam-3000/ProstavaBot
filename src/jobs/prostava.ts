import { ProstavaUtils, TelegramUtils } from "../utils";
import { PROSTAVA } from "../constants";
import { bot } from "../commons/bot";
import { User } from "../types";

export class ProstavaProcess {
    static async publishOrWithdrawCompletedProstavas(): Promise<void> {
        const completedProstavas = await ProstavaUtils.getPendingCompletedProstavasFromDB();
        for (const prostava of completedProstavas) {
            const command = ProstavaUtils.getProstavaCompleteCommand(prostava);
            const user = (prostava.is_request ? prostava.creator : prostava.author) as User;
            bot.handleUpdate(TelegramUtils.fillCommandFakeUpdate(prostava.group_id, user.user_id, command));
        }
    }

    static async remindUsersRateProstavas(): Promise<void> {
        const pendingProstavas = await ProstavaUtils.getPendingUncompletedProstavasFromDB();
        for (const prostava of pendingProstavas) {
            const command = prostava.is_request ? PROSTAVA.COMMAND.REQUEST_RATE : PROSTAVA.COMMAND.PROSTAVA_RATE;
            const user = (prostava.is_request ? prostava.creator : prostava.author) as User;
            bot.handleUpdate(TelegramUtils.fillCommandFakeUpdate(prostava.group_id, user.user_id, command));
        }
    }

    static async rejectExpiredProstavas(): Promise<void> {
        const expiredProstavas = await ProstavaUtils.getExpiredProstavasFromDB();
        const groupIds = new Set<number>();
        expiredProstavas.forEach((prostava) => {
            groupIds.add(prostava.group_id);
        });
        groupIds.forEach((groupId) => {
            bot.handleUpdate(
                TelegramUtils.fillCommandFakeUpdate(
                    groupId,
                    bot.botInfo?.id,
                    PROSTAVA.COMMAND.PROSTAVAS_REJECT,
                    bot.botInfo?.is_bot
                )
            );
        });
    }
}
