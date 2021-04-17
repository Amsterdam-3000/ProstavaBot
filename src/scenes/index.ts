import { Scenes } from "telegraf";
import { UpdateContext } from "../types";
import { helpScene } from "./help";
import { profileScene } from "./profile";
import { prostavaScene } from "./prostava";
import { settingsScene } from "./settings";
import { startScene } from "./start";

//TODO ttl for stage
export const mainStage = new Scenes.Stage<UpdateContext>([
    startScene,
    helpScene,
    settingsScene,
    profileScene,
    prostavaScene
]);

export * from "./prostava";
