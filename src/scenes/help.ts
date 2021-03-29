import { Scenes } from "telegraf";
import { SCENE } from "../commons/constants";
import { UpdateContext } from "../types/telegraf";

export const helpScene = new Scenes.BaseScene<UpdateContext>(SCENE.HELP);

//TODO Help