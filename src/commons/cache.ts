import { Context } from "telegraf";
import RedisSession from "telegraf-session-redis";
import { StringUtils } from "../utils";
import { CONFIG } from "./config";

export const cache = new RedisSession({
    // ttl: 90000,
    store: {
        host: "",
        port: "",
        url: CONFIG.REDIS_URI
    },
    getSessionKey: (ctx: Context) => StringUtils.concatSessionKey(ctx.from?.id, ctx.chat?.id)
});
