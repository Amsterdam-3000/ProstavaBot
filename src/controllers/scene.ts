import { SCENE } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";

export const enterStartScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.START);
export const enterSettingsScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.SETTINGS);
export const enterHelpScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.HELP);