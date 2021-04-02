import { Markup } from "telegraf";
import { ACTION, DEFAULT_CODE, LOCALE_ACTION } from "../commons/constants";
import { stringifyActionData } from "../commons/utils";
import { UpdateContext } from "../types";
import { oneColumn } from "./scene";

export const getProfileKeyboard = (ctx: UpdateContext) =>
    Markup.inlineKeyboard(
        [
            Markup.button.callback(
                ctx.i18n.t(LOCALE_ACTION.SET_EMOJI, { emoji: ctx.session.user.personal_data.emoji }),
                stringifyActionData(ACTION.SET_EMOJI)
            ),
            Markup.button.callback(
                ctx.i18n.t(LOCALE_ACTION.SET_BIRTHDAY, {
                    birthday:
                        (ctx.session.user.personal_data.birthday &&
                            ctx.session.user.personal_data.birthday.toLocaleDateString()) ||
                        DEFAULT_CODE.BIRTHDAY
                }),
                stringifyActionData(ACTION.SET_BIRTHDAY)
            )
        ],
        {
            wrap: oneColumn
        }
    );
