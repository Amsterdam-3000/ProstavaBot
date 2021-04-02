import { COMMAND_CODE, LOCALE_COMMAND, SCENE } from "../commons/constants";
import { setNewMessageState } from "../commons/utils";
import { UpdateContext } from "../types";
import { getLanguageKeyboard, getSettingsKeyboard } from "../views/settings";

export const enterSettingsScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.SETTINGS);

export const showSettings = async (ctx: UpdateContext) =>
    ctx
        .reply(ctx.i18n.t(LOCALE_COMMAND.SETTINGS, { command_code: COMMAND_CODE.SETTINGS }), getSettingsKeyboard(ctx))
        .then((message) => (ctx.scene.state = setNewMessageState(message)));

export const showLanguages = async (ctx: UpdateContext) =>
    ctx.editMessageText(
        ctx.i18n.t(LOCALE_COMMAND.LANGUAGE, { command_code: COMMAND_CODE.LANGUAGE }),
        getLanguageKeyboard(ctx)
    );

export const backToSettings = async (ctx: UpdateContext) =>
    ctx.editMessageText(
        ctx.i18n.t(LOCALE_COMMAND.SETTINGS, { command_code: COMMAND_CODE.SETTINGS }),
        getSettingsKeyboard(ctx)
    );
