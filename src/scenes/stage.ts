import { Scenes } from "telegraf";
import { startScene, helpScene, settingsScene } from ".";
import { UpdateContext } from "../types/telegraf";

//Create indefinite stage for all scenes
export const mainStage = new Scenes.Stage<UpdateContext>([startScene, helpScene, settingsScene]);