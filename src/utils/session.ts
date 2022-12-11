import { Context } from "telegraf";
import { SessionCollection } from "../models";

export class SessionUtils {
    static saveChatIdToUserSession(userId?: number, chatId?: number): void {
        if (!userId || !chatId) {
            return;
        }
        SessionCollection.updateOne(
            { key: `${userId}` },
            { $set: { data: { chat_id: chatId } } },
            { upsert: true }
        ).exec();
    }

    static getSessionKey = (ctx: Context): string => {
        if (ctx.from == null) {
            return "";
        }
        if (ctx.chat == null) {
            return `${ctx.from.id}`;
        }
        return `${ctx.from.id}:${ctx.chat.id}`;
    };
}
