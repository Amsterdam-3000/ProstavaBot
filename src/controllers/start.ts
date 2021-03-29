import { SCENE } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";

export const enterStartScene = async (ctx: UpdateContext) => ctx.scene.enter(SCENE.START);