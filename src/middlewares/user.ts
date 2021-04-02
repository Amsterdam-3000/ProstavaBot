import { MEMBER_STATUS, LOCALE_REPLY, ERROR_CODE } from "../commons/constants";
import { CONFIG } from "../commons/config";
import { UpdateContext, User } from "../types";
import { UserCollection } from "../models";
import { Message } from "telegraf/typings/core/types/typegram";

export const isUserAdmin = async (ctx: UpdateContext, next: Function) => {
    if (ctx.callbackQuery.from.id === CONFIG.SUPER_ADMIN_ID) {
        return next();
    }
    //TODO Catch error
    const chatMember = await ctx.getChatMember(ctx.callbackQuery.from.id);
    if (chatMember.status === MEMBER_STATUS.OWNER || chatMember.status === MEMBER_STATUS.ADMIN) {
        return next();
    }
    return ctx.answerCbQuery(ctx.i18n.t(LOCALE_REPLY.NOT_ADMIN, { error_code: ERROR_CODE.NOT_ADMIN }));
};

export const addUserToSession = async (ctx: UpdateContext, next: Function) => {
    if (ctx.session.user) {
        return next();
    }
    const users = ctx.session.group.users as [User];
    ctx.session.user = users.find((user) => user.user_id === ctx.from.id);
    if (ctx.session.user) {
        return next();
    }
    //TODO Catch error
    ctx.session.user = await UserCollection.upsertUser(ctx.from.id, ctx.chat.id);
    if (ctx.session.user) {
        return next();
    }
    return ctx.reply(ctx.i18n.t(LOCALE_REPLY.APP_WRONG, { error_code: ERROR_CODE.APP_WRONG }));
};

export const saveUserPersonalData = async (ctx: UpdateContext, next: Function) => {
    //TODO Catch error
    await UserCollection.updatePersonalData(
        ctx.session.user.user_id,
        ctx.session.user.group_id,
        ctx.session.user.personal_data
    );
    return next();
};

export const changeUserEmoji = async (ctx: UpdateContext, next: Function) => {
    const message = ctx.message as Message.TextMessage;
    if (message.text === ctx.session.user.personal_data.emoji) {
        return;
    }
    ctx.session.user.personal_data.emoji = message.text;
    return next();
};

export const changeUserBirthday = async (ctx: UpdateContext, next: Function) => {
    const message = ctx.message as Message.TextMessage;
    const birthday = new Date(message.text);
    if (
        ctx.session.user.personal_data.birthday &&
        ctx.session.user.personal_data.birthday.toLocaleDateString() === birthday.toLocaleDateString()
    ) {
        return;
    }
    ctx.session.user.personal_data.birthday = birthday;
    return next();
};
