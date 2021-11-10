import Queue from "bull";
import { bot } from "../commons/bot";
import { CODE, PROSTAVA } from "../constants";
import { DateUtils, TelegramUtils, UserUtils } from "../utils";

export class UserProcess {
    static async announceReuestsForBithdayUsers(job: Queue.Job): Promise<void> {
        const nowNextWeek = DateUtils.getNowDateNextWeek();
        const birthdayUsers = await UserUtils.getBirthdayUsersOnDateFromDB(nowNextWeek);
        for (const user of birthdayUsers) {
            const command = PROSTAVA.COMMAND.REQUEST;
            const commandText = `${user.user_id}|${CODE.ACTION.PROFILE_BIRTHDAY}`;
            bot.handleUpdate(
                TelegramUtils.fillCommandFakeUpdate(
                    user.group_id,
                    bot.botInfo?.id,
                    command,
                    bot.botInfo?.is_bot,
                    commandText
                )
            );
        }
    }
}
