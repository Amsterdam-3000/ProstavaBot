import { Scenes } from "telegraf";
import { SCENE } from "../commons/constants";
import { UpdateContext } from "../commons/interfaces";

export const settingsScene = new Scenes.BaseScene<UpdateContext>(SCENE.SETTINGS);

//TODO controllers