import { Markup } from "telegraf";
import { ACTION, DEFAULT_CODE, LOCALE_ACTION } from "../commons/constants";
import { UpdateContext } from "../types";

export const getBackButton = (ctx: UpdateContext) =>
    Markup.button.callback(ctx.i18n.t(LOCALE_ACTION.BACK, { default_code: DEFAULT_CODE.BACK }), ACTION.BACK);

export const oneColumn = (btn, index, currentRow) => currentRow.length === 1;
