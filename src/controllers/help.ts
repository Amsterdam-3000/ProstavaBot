import { SCENE } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";

export const enterHelpScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.HELP);

export const showHelp = async (ctx: UpdateContext) => ctx.replyWithHTML(ctx.help);
