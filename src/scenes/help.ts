import { Scenes } from "telegraf";
import { SCENE } from "../commons/constants";
import { UpdateContext } from "../commons/interfaces";

export const helpScene = new Scenes.BaseScene<UpdateContext>(SCENE.HELP);

//TODO controllers