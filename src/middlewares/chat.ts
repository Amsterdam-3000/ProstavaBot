import { CHAT_TYPE, LOCALE_REPLY } from "../commons/constants";
import { UpdateContext } from "../commons/interfaces";

export const isGroup = async (ctx: UpdateContext, next: Function) => {
    if (ctx.chat.type === CHAT_TYPE.GROUP) {
        return next();
    }
    return ctx.reply(ctx.i18n.t(LOCALE_REPLY.NOT_GROUP));
};
