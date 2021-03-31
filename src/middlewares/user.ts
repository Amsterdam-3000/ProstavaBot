import { MEMBER_STATUS, LOCALE_REPLY } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";
import { CONFIG } from "../commons/config";

export const isUserAdmin = async (ctx: UpdateContext, next: Function) => { 
    if (ctx.callbackQuery.from.id === CONFIG.SUPER_ADMIN_ID) {
        return next();
    }
    //TODO Catch error
    const chatMember = await ctx.getChatMember(ctx.callbackQuery.from.id);
    if (chatMember.status === MEMBER_STATUS.OWNER || chatMember.status === MEMBER_STATUS.ADMIN) {
        return next();
    }
    return ctx.answerCbQuery(ctx.i18n.t(LOCALE_REPLY.NOT_ADMIN));
};
