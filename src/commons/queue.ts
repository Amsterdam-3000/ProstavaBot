import Queue from "bull";
import { PROSTAVA } from "../constants";
import { CONFIG } from "./config";

export const prostavaQueue = new Queue(PROSTAVA.QUEUE.PROSTAVA, CONFIG.REDIS_URL, {
    //TODO Need local redis for dev
    prefix: `${process.env.NODE_ENV}:${PROSTAVA.COLLECTION.QUEUE}`,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false
    }
});

prostavaQueue.add(
    PROSTAVA.JOB.PROSTAVA_AUTO_PUBLISH,
    {},
    {
        repeat: {
            cron: "* * * * *"
        }
    }
);
prostavaQueue.add(
    PROSTAVA.JOB.PROSTAVA_RATE_REMINDER,
    {},
    {
        repeat: {
            cron: "0 * * * *"
        }
    }
);
prostavaQueue.add(
    PROSTAVA.JOB.PROSTAVA_REJECT_EXPIRED,
    {},
    {
        repeat: {
            cron: "11 22 * * *",
            tz: "Europe/Moscow"
        }
    }
);
prostavaQueue.add(
    PROSTAVA.JOB.USER_BIRTHDAY_REMINDER,
    {},
    {
        repeat: {
            cron: "22 11 * * *",
            tz: "Europe/Moscow"
        }
    }
);
prostavaQueue.add(
    PROSTAVA.JOB.STATS_SHOW_LAST_YEAR,
    {},
    {
        repeat: {
            cron: "11 11 1 1 *",
            tz: "Europe/Moscow"
        }
    }
);
