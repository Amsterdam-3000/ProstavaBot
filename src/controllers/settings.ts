import { SCENE } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";

export const enterSettingsScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.SETTINGS);