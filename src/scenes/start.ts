import { Scenes } from "telegraf";
import { SCENE } from "../commons/constants";
import { enterHelpScene } from "../controllers";
import { UpdateContext } from "../types/telegraf";

export const startScene = new Scenes.BaseScene<UpdateContext>(SCENE.START);

//Redirect to Help Scene
startScene.enter(enterHelpScene);
