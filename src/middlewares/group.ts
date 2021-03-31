import { CHAT_TYPE, LOCALE_REPLY } from "../commons/constants";
import { upsertGroup, updateSettings } from "../models/group";
import { UpdateContext } from "../types/telegraf";
import { CallbackQuery } from "telegraf/typings/core/types/typegram";
import { parseActionData } from "../commons/utils";

export const isGroupChat = async (ctx: UpdateContext, next: Function) => {
    if (ctx.chat.type === CHAT_TYPE.GROUP) {
        return next();
    }
    return ctx.reply(ctx.i18n.t(LOCALE_REPLY.NOT_GROUP));
};

export const addGroupToSession = async (ctx: UpdateContext, next: Function) => {
    if (ctx.session.group) {
        return next();
    }
    //TODO Catch error    
    ctx.session.group = await upsertGroup(ctx.chat.id);
    if (ctx.session.group) {
        return next();
    }
    return ctx.reply(ctx.i18n.t(LOCALE_REPLY.APP_WRONG));
};

export const applyGroupSettings = async (ctx: UpdateContext, next: Function) => {
    ctx.i18n.locale(ctx.session.group.settings.language);
    return next();
};

export const saveGroupSettings = async (ctx: UpdateContext, next: Function) => {
    //TODO Catch error    
    await updateSettings(ctx.session.group._id, ctx.session.group.settings);
    return next();
};

export const changeLanguage = async (ctx: UpdateContext, next: Function) => {
    const dataCallbackQuery = ctx.callbackQuery as CallbackQuery.DataCallbackQuery;
    const actionData = parseActionData(dataCallbackQuery.data);
    if (actionData.value === ctx.i18n.languageCode) {
        return ctx.answerCbQuery();
    }
    ctx.session.group.settings.language = actionData.value;
    return next();
};
