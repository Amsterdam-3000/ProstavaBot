import { Scenes } from "telegraf";
import { SCENE } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";
import { isAdmin } from "../middlewares";

export const settingsScene = new Scenes.BaseScene<UpdateContext>(SCENE.SETTINGS);

settingsScene.use(isAdmin);

//TODO Settings
