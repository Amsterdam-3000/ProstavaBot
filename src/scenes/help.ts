import { Scenes } from "telegraf";
import { SCENE } from "../commons/constants";
import { showHelp } from "../controllers";
import { UpdateContext } from "../types/telegraf";

export const helpScene = new Scenes.BaseScene<UpdateContext>(SCENE.HELP);

helpScene.enter(showHelp);