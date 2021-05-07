import { Context } from "telegraf";
import RedisSession from "telegraf-session-redis";
import { ConverterUtils } from "../utils";
import { CONFIG } from "./config";

export const cache = new RedisSession({
    // ttl: 90000,
    store: {
        host: "",
        port: "",
        url: CONFIG.REDIS_URI
    },
    getSessionKey: (ctx: Context) => ConverterUtils.concatSessionKey(ctx.from?.id, ctx.chat?.id)
});
