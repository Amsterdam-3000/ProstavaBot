import { COMMAND_CODE, DEFAULT_CODE, LOCALE_COMMAND, LOCALE_REPLY, SCENE } from "../commons/constants";
import { setNewMessageState } from "../commons/utils";
import { UpdateContext } from "../types";
import { getProfileKeyboard } from "../views/profile";

export const enterProfileScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.PROFILE);

export const showProfile = async (ctx: UpdateContext) =>
    ctx
        .reply(
            ctx.i18n.t(LOCALE_COMMAND.PROFILE, { command_code: COMMAND_CODE.PROFILE, username: ctx.from.username }),
            getProfileKeyboard(ctx)
        )
        .then((message) => (ctx.scene.state = setNewMessageState(message)));

export const showEmojiMessage = async (ctx: UpdateContext) =>
    ctx.answerCbQuery(ctx.i18n.t(LOCALE_REPLY.SEND_EMOJI, { default_code: DEFAULT_CODE.EMOJI }));

export const showBirthdayMessage = async (ctx: UpdateContext) =>
    ctx.answerCbQuery(ctx.i18n.t(LOCALE_REPLY.SEND_BIRTHDAY, { default_code: DEFAULT_CODE.BIRTHDAY }));
