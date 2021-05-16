import Queue from "bull";
import { DateUtils, ProstavaUtils, TelegramUtils, UserUtils } from "../utils";
import { CODE, PROSTAVA } from "../constants";
import { bot } from "../commons/bot";
import { User } from "../types";

export class ProstavaProcess {
    static async publishCompletedProstavas(job: Queue.Job) {
        const completedProstavas = await ProstavaUtils.getPendingCompletedProstavasFromDB();
        for (const prostava of completedProstavas) {
            const command = prostava.is_request ? PROSTAVA.COMMAND.REQUEST_SAVE : PROSTAVA.COMMAND.PROSTAVA_SAVE;
            const user = (prostava.is_request ? prostava.creator : prostava.author) as User;
            bot.handleUpdate(TelegramUtils.fillCommandFakeUpdate(prostava.group_id, user.user_id, command));
        }
    }

    static async remindUsersRateProstavas(job: Queue.Job) {
        const pendingProstavas = await ProstavaUtils.getPendingUncompletedProstavasFromDB();
        for (const prostava of pendingProstavas) {
            const command = prostava.is_request ? PROSTAVA.COMMAND.REQUEST_RATE : PROSTAVA.COMMAND.PROSTAVA_RATE;
            const user = (prostava.is_request ? prostava.creator : prostava.author) as User;
            bot.handleUpdate(TelegramUtils.fillCommandFakeUpdate(prostava.group_id, user.user_id, command));
        }
    }

    static async announceReuestsForBithdayUsers(job: Queue.Job) {
        const nowNextWeek = DateUtils.getNowDateNextWeek();
        const birthdayUsers = await UserUtils.getBirthdayUsersOnDateFromDB(nowNextWeek);
        for (const user of birthdayUsers) {
            const command = PROSTAVA.COMMAND.REQUEST;
            const commandText = `${user.user_id}|${CODE.ACTION.PROFILE_BIRTHDAY}`;
            bot.handleUpdate(TelegramUtils.fillCommandFakeUpdate(user.group_id, bot.botInfo?.id, command, commandText));
        }
    }
}
