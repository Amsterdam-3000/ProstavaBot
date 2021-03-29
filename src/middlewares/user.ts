import { MEMBER_STATUS, LOCALE_REPLY } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";
import { CONFIG } from "../commons/config";

export const isAdmin = async (ctx: UpdateContext, next: Function) => {
    if (ctx.message.from.id === CONFIG.SUPER_ADMIN_ID) {
        return next();
    }
    const chatMember = await ctx.getChatMember(ctx.message.from.id);
    if (chatMember.status === MEMBER_STATUS.OWNER || chatMember.status === MEMBER_STATUS.ADMIN) {
        return next();
    }
    ctx.reply(ctx.i18n.t(LOCALE_REPLY.NOT_ADMIN));
    return ctx.scene.leave();
};
