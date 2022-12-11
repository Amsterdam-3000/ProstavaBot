import { PROSTAVA } from "./constants";
import { mongo } from "./commons/db";
import { agenda } from "./commons/job";
import { ProstavaProcess, StatsProcess, UserProcess } from "./jobs";

export function launchJobs(): void {
    agenda.mongo(mongo.db, "jobs");

    agenda.define(PROSTAVA.JOB.PROSTAVA_AUTO_PUBLISH, ProstavaProcess.publishOrWithdrawCompletedProstavas);
    agenda.define(PROSTAVA.JOB.PROSTAVA_RATE_REMINDER, ProstavaProcess.remindUsersRateProstavas);
    agenda.define(PROSTAVA.JOB.PROSTAVA_REJECT_EXPIRED, ProstavaProcess.rejectExpiredProstavas);
    agenda.define(PROSTAVA.JOB.USER_BIRTHDAY_REMINDER, UserProcess.announceReuestsForBithdayUsers);
    agenda.define(PROSTAVA.JOB.STATS_SHOW_LAST_YEAR, StatsProcess.showLastYearStats);

    agenda.every("* * * * *", [PROSTAVA.JOB.PROSTAVA_AUTO_PUBLISH]);
    agenda.every("0 * * * *", [PROSTAVA.JOB.PROSTAVA_RATE_REMINDER]);
    agenda.every("11 22 * * *", [PROSTAVA.JOB.PROSTAVA_REJECT_EXPIRED], null, { timezone: "Europe/Moscow" });
    agenda.every("22 11 * * *", [PROSTAVA.JOB.USER_BIRTHDAY_REMINDER], null, { timezone: "Europe/Moscow" });
    agenda.every("11 11 1 1 *", [PROSTAVA.JOB.STATS_SHOW_LAST_YEAR], null, { timezone: "Europe/Moscow" });

    agenda.start();
}
