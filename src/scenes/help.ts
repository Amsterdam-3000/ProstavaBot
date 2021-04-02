import { Scenes } from "telegraf";
import { SCENE } from "../commons/constants";
import { forbidAction, showHelp } from "../controllers";
import { UpdateContext } from "../types";

export const helpScene = new Scenes.BaseScene<UpdateContext>(SCENE.HELP);

helpScene.enter(showHelp);

helpScene.action(/./, forbidAction);
