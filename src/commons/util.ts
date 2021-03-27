import { UpdateContext } from "../commons/interfaces";

export const getSceneController = (scene: string) => async (ctx: UpdateContext) => ctx.scene.enter(scene);
