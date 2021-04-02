import { Scenes } from "telegraf";
import { startScene, helpScene, settingsScene, profileScene } from ".";
import { UpdateContext } from "../types";

//Create indefinite stage for all scenes
export const mainStage = new Scenes.Stage<UpdateContext>([startScene, helpScene, settingsScene, profileScene]);
