import { Message } from "telegraf/typings/core/types/typegram";
import { LOCALE_COMMAND, SCENE } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";
import { getLanguageKeyboard, getSettingsKeyboard } from "../views/settings";

export const enterSettingsScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.SETTINGS);

export const showSettings = async (ctx: UpdateContext) =>
    ctx
        .reply(ctx.i18n.t(LOCALE_COMMAND.SETTINGS), getSettingsKeyboard(ctx))
        .then((message) => (ctx.scene.state = message));

export const showLanguages = async (ctx: UpdateContext) =>
    ctx.editMessageText(ctx.i18n.t(LOCALE_COMMAND.LANGUAGE), getLanguageKeyboard(ctx));

export const hideSettings = async (ctx: UpdateContext) => {
    const message = ctx.scene.state as Message;
    ctx.deleteMessage(message.message_id);
};
