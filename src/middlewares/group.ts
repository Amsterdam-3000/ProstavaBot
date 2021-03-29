import { CHAT_TYPE, LOCALE_REPLY } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";
import { GroupCollection } from "../models";

export const addGroup = async (ctx: UpdateContext, next: Function) => {
    if (ctx.session.group) {
        return next();
    }
    if (ctx.chat.type !== CHAT_TYPE.GROUP) {
        return ctx.reply(ctx.i18n.t(LOCALE_REPLY.NOT_GROUP));
    }
    ctx.session.group = await GroupCollection.findOneAndUpdate(
        { _id: ctx.chat.id },
        {},
        { upsert: true, setDefaultsOnInsert: true }
    );
    if (!ctx.session.group) {
        return ctx.reply(ctx.i18n.t(LOCALE_REPLY.APP_WRONG));
    }
    return next();
};
